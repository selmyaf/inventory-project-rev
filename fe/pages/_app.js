import "@/styles/globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import 'datatables.net-dt/css/dataTables.dataTables.css';
import Header from "@/components/header";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Header />
      <div className="pt-[80px]"> {/* kasih padding biar konten ga ketimpa header */}
        <Component {...pageProps} />
      </div>
    </>
  );
}
