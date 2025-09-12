export default function ContactSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <div className="mb-4">
          <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">Bedankt!</h1>
        <p className="text-lg mb-2">Je contactbericht is succesvol bevestigd en verzonden.</p>
        <p className="text-gray-600">We nemen zo snel mogelijk contact met je op.</p>
        <div className="mt-6">
          <a 
            href="/contact" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Terug naar contact
          </a>
        </div>
      </div>
    </div>
  );
}