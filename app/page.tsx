import Image from "next/image";

const baseButton = "h-12 rounded-full px-5 py-2 font-medium text-sm sm:text-base transition-colors flex items-center gap-2";

export default function Home() {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center">

                <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 dark:text-gray-100 tracking-wide">
                    BudgetBelastingen
                </h1>

                <div className="flex gap-4 flex-col sm:flex-row">
                    <div className="flex gap-4 flex-col ">
                        <a className={`${baseButton} bg-blue-600 text-white hover:bg-green-600`}
                            href="#"
                            //target="_blank"
                            rel="noopener noreferrer">
                            <Image

                                src="/add.svg"
                                alt="toevoegen"
                                width={20}
                                height={20}
                            />
                            Factuur toevoegen
                        </a>
                        <a className={`${baseButton} border border-gray-300 hover:bg-gray-100 hover:text-[#333]`}
                            href="#"
                            //target="_blank"
                            rel="noopener noreferrer">
                            <Image

                                src="/edit.svg"
                                alt="aanpassen"
                                width={20}
                                height={20}
                            />
                            Facturen beheren
                        </a>
                    </div>
                    <div className="flex gap-4 flex-col ">
                        <a className={`${baseButton} border border-gray-300 hover:bg-gray-100 hover:text-[#333]`}
                            href="#"
                            //target="_blank"
                            rel="noopener noreferrer">
                            <Image

                                src="/dashboards.svg"
                                alt="dashboard"
                                width={20}
                                height={20}
                            />
                            Overzicht & berekeningen
                        </a>
                        <a className={`${baseButton} border border-gray-300 hover:bg-gray-100 hover:text-[#333]`}
                            href="#"
                            //target="_blank"
                            rel="noopener noreferrer">
                            <Image

                                src="/excel.svg"
                                alt="excel download"
                                width={20}
                                height={20}
                            />
                            Exporteer naar Excel
                        </a>
                    </div>
                </div>

                <div className="mt-8 p-4 border rounded-lg text-center bg-gray-50 dark:bg-gray-900">
                    <h2 className="text-lg font-semibold mb-2">Volgende BTW-aangifte</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        U kunt aangifte doen vanaf <strong>1 oktober 2025</strong> <br />
                        U moet uiterlijk indienen vóór <strong>31 oktober 2025</strong> <br />
                        <span className="text-blue-600 font-medium">Nog 26 dagen te gaan</span>
                    </p>
                </div>


            </main>
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
                    href="#"
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
        </div>
    );
}
