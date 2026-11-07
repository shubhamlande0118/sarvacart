import { useState } from "react";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { useStore } from "../../lib/store";
import { Page, SectionTitle, Reveal, Button } from "../../components/ui";

export default function SellerKyc() {
  const { submitKyc, seller } = useStore();
  const [status, setStatus] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const kycStatus = seller?.status || "pending";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitKyc(documentType, documentUrl || undefined);
      setStatus("submitted");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <Reveal>
        <SectionTitle eyebrow="KYC Verification" title="Verify Your Identity" subtitle="Submit your business documents for admin approval." />
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Reveal className="lg:col-span-2">
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-[#b8733b]" />
              <h2 className="font-serif text-2xl font-bold text-[#1c1917]">Submit KYC Documents</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-[#665f5a]">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
                >
                  <option value="">Select document type</option>
                  <option value="GST Registration">GST Registration Certificate</option>
                  <option value="Trade License">Trade License</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#665f5a]">Document Image URL</label>
                <input
                  type="text"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://example.com/document.jpg"
                  className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
                />
                <p className="mt-1 text-xs text-[#665f5a]">Upload your document to any image hosting service and paste the URL here.</p>
              </div>

              <Button type="submit" full disabled={loading || !documentType || !documentUrl}>
                {loading ? "Submitting…" : "Submit for Review"}
              </Button>
            </form>
          </div>
        </Reveal>

        <Reveal className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-[#b8733b]" />
            <h2 className="font-serif text-2xl font-bold text-[#1c1917]">KYC Status</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#fff7f2] border border-[#e8ddd2]">
              <div>
                <p className="text-sm text-[#665f5a]">Current Status</p>
                <p className="font-serif text-lg font-bold text-[#1c1917]">{kycStatus.toUpperCase()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${kycStatus === "approved" ? "bg-emerald-100 text-emerald-700" : kycStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                {kycStatus.toUpperCase()}
              </span>
            </div>

            {status === "submitted" && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-100 border border-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="text-sm text-emerald-700">KYC submitted successfully. Awaiting admin review.</p>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-100 border border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">Failed to submit KYC. Please try again.</p>
              </div>
            )}

            <div className="pt-4 border-t border-[#f0e8dd]">
              <p className="text-sm text-[#665f5a]">What happens next?</p>
              <ul className="mt-2 space-y-2 text-sm text-[#665f5a] list-disc list-inside">
                <li>Admin reviews your submitted documents</li>
                <li>You'll be notified of approval or rejection</li>
                <li>Approved sellers can list products and receive orders</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </Page>
  );
}
