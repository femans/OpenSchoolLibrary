import QRCode from 'qrcode';

/**
 * Generate a QR code for a given URL.
 * @param url The URL to encode in the QR code
 * @param options QR code generation options
 * @returns Promise<string> Data URL of the generated QR code image
 */
export async function generateQRCode(
	url: string,
	options?: {
		width?: number;
		margin?: number;
		color?: {
			dark?: string;
			light?: string;
		};
	}
): Promise<string> {
	const defaultOptions = {
		width: 300,
		margin: 2,
		color: {
			dark: '#000000',
			light: '#FFFFFF'
		},
		...options
	};

	try {
		const dataUrl = await QRCode.toDataURL(url, defaultOptions);
		return dataUrl;
	} catch (error) {
		console.error('Error generating QR code:', error);
		throw new Error('Failed to generate QR code');
	}
}

/**
 * Generate a QR code for a child's reading journal page.
 * @param baseUrl The base URL of the application
 * @param emojiId The child's emoji ID
 * @returns Promise<string> Data URL of the QR code
 */
export async function generateReaderQRCode(baseUrl: string, emojiId: string): Promise<string> {
	const url = `${baseUrl}/reader/${encodeURIComponent(emojiId)}`;
	return generateQRCode(url);
}

/**
 * Generate a QR code as an SVG string instead of data URL.
 * Useful for embedding in HTML or printing.
 */
export async function generateQRCodeSVG(
	url: string,
	options?: {
		width?: number;
		margin?: number;
		color?: {
			dark?: string;
			light?: string;
		};
	}
): Promise<string> {
	const defaultOptions = {
		width: 300,
		margin: 2,
		color: {
			dark: '#000000',
			light: '#FFFFFF'
		},
		...options
	};

	try {
		const svg = await QRCode.toString(url, {
			type: 'svg',
			...defaultOptions
		});
		return svg;
	} catch (error) {
		console.error('Error generating QR code SVG:', error);
		throw new Error('Failed to generate QR code SVG');
	}
}
