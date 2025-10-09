
export default function LoadingIcon() {
    return (
        <div className="flex flex-col items-center justify-center py-6">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className={`mt-2 text-emerald-600 text-base font-semibold`}>Loading...</p>
        </div>
    );
}