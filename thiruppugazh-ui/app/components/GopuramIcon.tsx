import Image from 'next/image';

export default function GopuramIcon({ className = "w-9 h-9" }: { className?: string }) {
    return (
        <img
            src="/images/lord-murugan-abodes.jpg"
            alt="Lord Murugan"
            className={`${className} object-cover rounded-md border border-amber-400/40 shadow-sm`}
        />
    );
}