import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState
from app.domain.pedagogy.socratic import socratic_manager
from app.services.vision import vision_service

router = APIRouter()


async def safe_send_json(websocket: WebSocket, payload: dict) -> bool:
    """Безопасная отправка JSON без исключений при обрыве соединения."""
    if websocket.client_state == WebSocketState.CONNECTED:
        try:
            await websocket.send_json(payload)
            return True
        except (WebSocketDisconnect, RuntimeError):
            return False
    return False


@router.websocket("/ws/{session_id}")
async def socratic_chat_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        while True:
            try:
                raw_data = await websocket.receive_text()
            except (WebSocketDisconnect, RuntimeError):
                break

            try:
                payload = json.loads(raw_data)
            except json.JSONDecodeError:
                await safe_send_json(
                    websocket, {"type": "error", "content": "Invalid JSON format"}
                )
                continue

            # ИЗВЛЕКАЕМ ДАННЫЕ БЕЗ ЗАХАРДКОЖЕННЫХ ДЕФОЛТОВ С ТРИГОНОМЕТРИЕЙ
            student_text = payload.get("message") or ""
            hint_type = payload.get("hint_type", None)
            subject = payload.get("subject") or "Математика"
            exam_type = payload.get("exam_type") or "ЕГЭ"
            competency_title = payload.get("competency") or "Решение задачи"
            task_context = payload.get("task_context") or student_text or "Условие задачи"
            p_mastery = float(payload.get("p_mastery") or 0.3)
            chat_history = payload.get("history") or []
            base64_image = payload.get("image", None)

            is_client_connected = True

            try:
                if base64_image:
                    await safe_send_json(
                        websocket,
                        {
                            "type": "token",
                            "content": "🔍 *Сканирую решение с фото тетради...*\n\n",
                        },
                    )
                    ocr_analysis = await vision_service.analyze_notebook_photo(
                        base64_image, task_context
                    )
                    await safe_send_json(
                        websocket, {"type": "token", "content": ocr_analysis}
                    )
                else:
                    async for chunk in socratic_manager.generate_response_stream(
                        subject=subject,
                        competency_title=competency_title,
                        task_context=task_context,
                        student_input=student_text,
                        p_mastery=p_mastery,
                        hint_type=hint_type,
                        exam_type=exam_type,
                        chat_history=chat_history,
                    ):
                        sent = await safe_send_json(
                            websocket, {"type": "token", "content": chunk}
                        )
                        if not sent:
                            is_client_connected = False
                            break
            except (WebSocketDisconnect, RuntimeError):
                is_client_connected = False
                break
            except Exception as e:
                print(f"❌ Chat WS Logic Error: {str(e)}")
                if is_client_connected:
                    await safe_send_json(
                        websocket,
                        {
                            "type": "token",
                            "content": f"\n\n⚠️ **Ошибка связи**: `{str(e)}`.",
                        },
                    )
            finally:
                if is_client_connected:
                    await safe_send_json(websocket, {"type": "end"})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket Unexpected Error: {str(e)}")
        if websocket.client_state == WebSocketState.CONNECTED:
            try:
                await websocket.close()
            except Exception:
                pass
    finally:
        print(f"ℹ️ WebSocket session closed cleanly: {session_id}")
