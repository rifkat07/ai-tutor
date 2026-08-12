import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.domain.pedagogy.socratic import socratic_manager
from app.services.vision import vision_service

router = APIRouter()


@router.websocket("/ws/{session_id}")
async def socratic_chat_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        while True:
            raw_data = await websocket.receive_text()
            try:
                payload = json.loads(raw_data)
            except json.JSONDecodeError:
                await websocket.send_json(
                    {"type": "error", "content": "Invalid JSON format"}
                )
                continue

            student_text = payload.get("message", "")
            hint_type = payload.get("hint_type", None)
            subject = payload.get("subject", "Математика")
            exam_type = payload.get("exam_type", "ЕГЭ")  # Считываем exam_type
            competency_title = payload.get("competency", "Тригонометрия")
            task_context = payload.get("task_context", "sin(x) = 0.5")
            p_mastery = payload.get("p_mastery", 0.3)
            chat_history = payload.get("history", [])
            base64_image = payload.get("image", None)

            try:
                if base64_image:
                    await websocket.send_json(
                        {"type": "token", "content": "🔍 *Сканирую решение с фото тетради...*\n\n"}
                    )
                    ocr_analysis = await vision_service.analyze_notebook_photo(
                        base64_image, task_context
                    )
                    await websocket.send_json({"type": "token", "content": ocr_analysis})
                else:
                    async for chunk in socratic_manager.generate_response_stream(
                        subject=subject,
                        competency_title=competency_title,
                        task_context=task_context,
                        student_input=student_text,
                        p_mastery=p_mastery,
                        hint_type=hint_type,
                        exam_type=exam_type,  # Передаем exam_type
                        chat_history=chat_history,
                    ):
                        await websocket.send_json({"type": "token", "content": chunk})
            except Exception as e:
                print(f"❌ Chat WS Error: {str(e)}")
                await websocket.send_json({
                    "type": "token",
                    "content": f"\n\n⚠️ **Ошибка связи**: `{str(e)}`."
                })
            finally:
                await websocket.send_json({"type": "end"})

    except WebSocketDisconnect:
        print(f"WebSocket session disconnected: {session_id}")
    except Exception as e:
        print(f"WebSocket Error: {str(e)}")
        await websocket.close()
