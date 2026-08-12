import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import requests


class TextbookUploaderGUI:

    def __init__(self, root):
        self.root = root
        self.root.title("📚 AI-Tutor v2.0 — Загрузчик PDF Учебников и Сборников")
        self.root.geometry("540x500")
        self.root.resizable(False, False)
        self.root.configure(bg="#0f172a")

        self.file_path = ""

        # Заголовок
        title_lbl = tk.Label(
            root,
            text="📥 Загрузка Учебников и Сборников ЕГЭ/ОГЭ",
            font=("Segoe UI", 12, "bold"),
            fg="#38bdf8",
            bg="#0f172a",
        )
        title_lbl.pack(pady=15)

        frame = tk.Frame(root, bg="#0f172a")
        frame.pack(padx=20, pady=5, fill="both")

        # 1. Выбор файла
        tk.Label(
            frame,
            text="1. Выберите PDF файл:",
            font=("Segoe UI", 10),
            fg="#f8fafc",
            bg="#0f172a",
        ).grid(row=0, column=0, sticky="w", pady=5)
        self.file_btn = tk.Button(
            frame,
            text="📁 Обзор PDF...",
            command=self.select_file,
            bg="#1e293b",
            fg="#ffffff",
            font=("Segoe UI", 9),
            borderwidth=1,
            cursor="hand2",
        )
        self.file_btn.grid(row=0, column=1, sticky="ew", pady=5, padx=10)

        self.file_lbl = tk.Label(
            frame,
            text="Файл не выбран",
            font=("Segoe UI", 8),
            fg="#94a3b8",
            bg="#0f172a",
            wraplength=280,
        )
        self.file_lbl.grid(row=1, column=0, columnspan=2, sticky="w", pady=2)

        # 2. Тип Материала (ЕГЭ / ОГЭ / Школа)
        tk.Label(
            frame,
            text="2. Раздел назначения:",
            font=("Segoe UI", 10, "bold"),
            fg="#38bdf8",
            bg="#0f172a",
        ).grid(row=2, column=0, sticky="w", pady=8)
        self.type_combo = ttk.Combobox(
            frame,
            values=[
                "🎓 Сборник заданий ЕГЭ (11 кл)",
                "📝 Сборник заданий ОГЭ (9 кл)",
                "🎒 Школьный учебник / Тетрадь (5–11 кл)",
            ],
            state="readonly",
            font=("Segoe UI", 9),
        )
        self.type_combo.current(0)
        self.type_combo.grid(row=2, column=1, sticky="ew", pady=8, padx=10)

        # 3. Автор / Составитель
        tk.Label(
            frame,
            text="3. Автор (например: Ященко И.В.):",
            font=("Segoe UI", 10),
            fg="#f8fafc",
            bg="#0f172a",
        ).grid(row=3, column=0, sticky="w", pady=8)
        self.author_entry = tk.Entry(
            frame,
            font=("Segoe UI", 10),
            bg="#1e293b",
            fg="#ffffff",
            insertbackground="white",
        )
        self.author_entry.insert(0, "Ященко И.В.")
        self.author_entry.grid(row=3, column=1, sticky="ew", pady=8, padx=10)

        # 4. Класс (5-11)
        tk.Label(
            frame,
            text="4. Класс (5–11):",
            font=("Segoe UI", 10),
            fg="#f8fafc",
            bg="#0f172a",
        ).grid(row=4, column=0, sticky="w", pady=8)
        self.grade_combo = ttk.Combobox(
            frame,
            values=["11", "9", "5", "6", "7", "8", "10"],
            state="readonly",
            font=("Segoe UI", 10),
        )
        self.grade_combo.current(0)
        self.grade_combo.grid(row=4, column=1, sticky="ew", pady=8, padx=10)

        # 5. Предмет
        tk.Label(
            frame,
            text="5. Предмет:",
            font=("Segoe UI", 10),
            fg="#f8fafc",
            bg="#0f172a",
        ).grid(row=5, column=0, sticky="w", pady=8)
        self.subject_combo = ttk.Combobox(
            frame,
            values=[
                "Математика (math)",
                "Физика (physics)",
                "Информатика (cs)",
                "Русский Язык (russian)",
            ],
            state="readonly",
            font=("Segoe UI", 10),
        )
        self.subject_combo.current(0)
        self.subject_combo.grid(row=5, column=1, sticky="ew", pady=8, padx=10)

        # 6. Название книги
        tk.Label(
            frame,
            text="6. Название книги:",
            font=("Segoe UI", 10),
            fg="#f8fafc",
            bg="#0f172a",
        ).grid(row=6, column=0, sticky="w", pady=8)
        self.title_entry = tk.Entry(
            frame,
            font=("Segoe UI", 10),
            bg="#1e293b",
            fg="#ffffff",
            insertbackground="white",
        )
        self.title_entry.insert(0, "ЕГЭ 2026. 36 типовых вариантов")
        self.title_entry.grid(row=6, column=1, sticky="ew", pady=8, padx=10)

        frame.columnconfigure(1, weight=1)

        # Кнопка Загрузить
        self.upload_btn = tk.Button(
            root,
            text="🚀 Оцифровать и Отправить в Раздел",
            command=self.start_upload,
            bg="#2563eb",
            fg="#ffffff",
            font=("Segoe UI", 10, "bold"),
            pady=8,
            cursor="hand2",
        )
        self.upload_btn.pack(fill="x", padx=30, pady=15)

        self.status_lbl = tk.Label(
            root, text="Готов к работе", font=("Segoe UI", 9), fg="#94a3b8", bg="#0f172a"
        )
        self.status_lbl.pack(pady=5)

    def select_file(self):
        filename = filedialog.askopenfilename(
            title="Выберите PDF файл", filetypes=[("PDF Files", "*.pdf")]
        )
        if filename:
            self.file_path = filename
            self.file_lbl.config(text=filename, fg="#38bdf8")

    def start_upload(self):
        if not self.file_path:
            messagebox.showerror("Ошибка", "Выберите PDF файл!")
            return
        author = self.author_entry.get().strip()
        if not author:
            messagebox.showerror("Ошибка", "Укажите автора!")
            return

        self.status_lbl.config(
            text="⏳ Идет оцифровка PDF и распределение по разделам...", fg="#f59e0b"
        )
        self.upload_btn.config(state="disabled")

        threading.Thread(target=self.upload_task, daemon=True).start()

    def upload_task(self):
        try:
            subject_map = {
                "Математика (math)": "math",
                "Физика (physics)": "physics",
                "Информатика (cs)": "cs",
                "Русский Язык (russian)": "russian",
            }
            type_map = {
                "🎓 Сборник заданий ЕГЭ (11 кл)": "EGE",
                "📝 Сборник заданий ОГЭ (9 кл)": "OGE",
                "🎒 Школьный учебник / Тетрадь (5–11 кл)": "SCHOOL",
            }

            subj_code = subject_map.get(self.subject_combo.get(), "math")
            type_code = type_map.get(self.type_combo.get(), "EGE")
            grade_code = int(self.grade_combo.get())

            url = "http://localhost:8000/api/v1/textbooks/upload-pdf"
            data = {
                "author": self.author_entry.get().strip(),
                "grade": grade_code,
                "subject": subj_code,
                "material_type": type_code,
                "title": self.title_entry.get().strip(),
            }

            with open(self.file_path, "rb") as f:
                files = {"file": f}
                res = requests.post(url, data=data, files=files, timeout=120)

            if res.status_code == 200:
                json_res = res.json()
                count = json_res.get("parsed_exercises_count", 0)
                self.root.after(0, lambda: self.on_success(count, type_code))
            else:
                err_msg = res.json().get("detail", res.text)
                self.root.after(0, lambda: self.on_error(err_msg))

        except Exception as e:
            self.root.after(0, lambda: self.on_error(str(e)))

    def on_success(self, count, type_code):
        self.status_lbl.config(
            text=f"✅ Успешно оцифровано {count} заданий!", fg="#10b981"
        )
        self.upload_btn.config(state="normal")
        target_name = "ЕГЭ" if type_code == "EGE" else ("ОГЭ" if type_code == "OGE" else "Школьный репетитор")
        messagebox.showinfo(
            "Успех!",
            f"Файл успешно оцифрован и отправлен в раздел [{target_name}]!\nИзвлечено {count} заданий.",
        )

    def on_error(self, err):
        self.status_lbl.config(text="❌ Ошибка загрузки", fg="#ef4444")
        self.upload_btn.config(state="normal")
        messagebox.showerror("Ошибка", f"Не удалось загрузить:\n{err}")


if __name__ == "__main__":
    root = tk.Tk()
    app = TextbookUploaderGUI(root)
    root.mainloop()
