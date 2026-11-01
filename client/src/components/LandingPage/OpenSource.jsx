import {Icon} from "./"
const GITHUB_REPO = "https://github.com/sahil-bainya/VertexCanvas";
export default function OpenSource() {
  return (
    <section id="opensource" className="px-6! py-24! flex justify-center">
      <div className="aura aura-gold mx-auto max-w-3xl">
        <div className="card border border-neutral-200 bg-neutral-50 p-10! text-center">
          <h2 className="font-display text-[24px] font-semibold tracking-tight text-zinc-900">
            Free and open source
          </h2>
          <p className="mt-2! text-sm text-zinc-900/60">
            VertexCanvas is released under the MIT license. Contributions
            welcome.
          </p>
          <div className="mt-6! flex flex-wrap items-center justify-center gap-4">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#6C3CEB] border border-[#6C3CEB] rounded-xl px-6! py-1! font-semibold shadow-md hover:bg-[#F5F0FF] transition-all duration-200 flex items-center gap-2"
            >
              <Icon name="github" className="h-4 w-4" />
              GitHub
            </a>
           
          </div>
        </div>
      </div>
    </section>
  );
}