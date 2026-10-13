import {Icon} from "./"
const GITHUB_REPO = "https://github.com/sahil-bainya/VertexCanvas";
export default function OpenSource() {
  return (
    <section id="opensource" className="px-6! py-24! flex justify-center">
      <div className="aura aura-gold mx-auto max-w-3xl">
        <div className="card border border-base-300 bg-base-200 p-10! text-center">
          <h2 className="font-display text-[24px] font-semibold tracking-tight text-base-content">
            Free and open source
          </h2>
          <p className="mt-2! text-sm text-base-content/60">
            VertexCanvas is released under the MIT license. Contributions
            welcome.
          </p>
          <div className="mt-6! flex flex-wrap items-center justify-center gap-4">
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3! btn gap-2 border-none bg-linear-to-r from-primary to-secondary text-primary-content"
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