import { Header } from "./header"
import { Footer } from "./footer"

export function Layout({ children, currentPage, backgroundColor = "bg-white", hideFooter = false }) {
  return (
    <div className={`min-h-screen ${backgroundColor} flex flex-col`}>
      <Header currentPage={currentPage} />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
} 