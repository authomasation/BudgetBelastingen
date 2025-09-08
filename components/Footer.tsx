import Image from "next/image";

export default function Footer() {
  return (
    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="#"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/login.svg"
          alt="login icon"
          width={16}
          height={16}
        />
        Login
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="/login"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/contact.svg"
          alt="contact icon"
          width={16}
          height={16}
        />
        Contact
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="#"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/disclaimer.svg"
          alt="disclaimer icon"
          width={16}
          height={16}
        />
        Disclaimer
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_aangifte_doen_en_betalen/btw-aangifte-waar-moet-u-aan-denken/hoe-btw-aangifte-invullen-en-versturen"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/bld_logo.png"
          alt="Belastingdienst logo"
          width={16}
          height={16}
        />
        Doe hier uw aangifte →
      </a>
    </footer>
  );
}
