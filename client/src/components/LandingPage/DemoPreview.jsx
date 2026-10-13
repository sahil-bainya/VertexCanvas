import {Icon} from "./"
export default function DemoPreview() {
  return (
    <section className="flex justify-center px-6! pb-24!">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-base-300 bg-base-300 shadow-xl">
        {/* Replace src with your actual screenshot or GIF */}
        <img
          src="https://res.cloudinary.com/datjhn3ph/image/upload/v1789636398/Screenshot_2026-09-17_144104_x51klo.png"
          alt="VertexCanvas — collaborative canvas with AI suggestions and live cursors"
          className="h-auto w-full"
          onError={(e) => {
            // Fallback UI if image not found
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
        <div
          style={{ display: "none" }}
          className="aspect-video items-center justify-center p-4!"
        >
          <div className="text-center">
            <div className="mx-auto mb-3! flex h-10 w-10 items-center justify-center rounded-full border border-base-300 text-base-content/60">
              <Icon name="cursor" className="h-4 w-4" />
            </div>
            <p className="text-[14px] text-base-content/60">
              Product preview coming soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}