import Image from "next/image";
import Footer from "@/components/Footer";
import AddInvoiceModal from "@/components/AddInvoiceModal";
import VolgendeAangifte from "@/components/AangifteKlok";
import Button from "@/components/ui/Button";

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

                        <AddInvoiceModal />
                        
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

                <VolgendeAangifte />


            </main>
            <Footer />
        </div>
    );
}
