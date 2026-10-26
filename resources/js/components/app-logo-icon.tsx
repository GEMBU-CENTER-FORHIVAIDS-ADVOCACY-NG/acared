import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/logo.jpeg"
            alt="Logo"
            className={props.className || 'h-10 w-10'}
        />
    );
}
