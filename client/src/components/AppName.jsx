import Logo from "./logo.jsx";
import "./AppName.css"
export default function AppName() {
  return (
    <div className="flex flex-row items-center gap-1 mb-8">
        <Logo className="w-12 h-12" />
        <div>
      <h1 className="flex items-center gap-2 font-sans text-xl md:text-3xl font-bold tracking-tight text-base-content">
        <span>
          Vertex<span className="text-primary">Canvas</span>
        </span>
      </h1>
      <p className="typewriter pl-1! font-sans text-xs font-bold text-base-content/60">
        A Space to Think, Create & Collaborate.
      </p>
</div>
    </div>
  );
}