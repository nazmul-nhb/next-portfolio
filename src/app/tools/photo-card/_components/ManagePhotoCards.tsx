import { ImagePlus } from 'lucide-react';
import ShareButton from '@/components/misc/share-button';
import SmartAlert from '@/components/misc/smart-alert';
import PhotoCardEditor from './PhotoCardEditor';

export default function ManagePhotoCards() {
    return (
        <div className="space-y-8 max-w-full">
            <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        Photo Card Generator
                    </h1>
                    <ShareButton
                        buttonLabel="Share this tool"
                        route="/tools/photo-card"
                        shareText="Photo Card Generator"
                    />
                </div>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                    Compose browser-based photo cards with uploaded images, layered typography,
                    live canvas preview, and local IndexedDB saving.
                </p>
            </div>

            <SmartAlert
                className="border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100"
                description={
                    <ul className="ml-5 list-disc space-y-1">
                        <li>Upload one or many images and arrange them as separate layers.</li>
                        <li>
                            Adjust canvas size, background color, text styling, and positioning
                            in real time.
                        </li>
                        <li>
                            Export finished cards as PNG or JPEG without leaving the browser.
                        </li>
                        <li>
                            Saved cards stay in IndexedDB on this device for later reloads and
                            downloads.
                        </li>
                    </ul>
                }
                title="How it works"
            />

            <PhotoCardEditor />

            <SmartAlert
                className="bg-emerald-600/10"
                description="Rendering, exporting, and saving happen locally in your browser. No images or card data are sent to a server."
                Icon={ImagePlus}
            />
        </div>
    );
}
