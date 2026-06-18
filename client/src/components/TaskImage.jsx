// Базовое изображение задачи. Рендерится над текстом вопроса,
// если у задачи задан image_url. Иначе ничего не выводит.

export default function TaskImage({ url }) {
  if (!url) return null;
  return (
    <div className="border border-cyber-border bg-cyber-black p-1">
      <img
        src={url}
        alt="Иллюстрация к задаче"
        loading="lazy"
        className="w-full max-h-56 object-contain mx-auto"
      />
    </div>
  );
}
