import { ImagePlus } from 'lucide-react';
import { PoweredBy } from '@/app/tools/_components/PoweredBy';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import SmartAlert from '@/components/misc/smart-alert';
import PhotoCardEditor from './PhotoCardEditor';

export default function ManagePhotoCards() {
    return (
        <div className="space-y-8 max-w-full">
            <TitleWithShare
                description="Compose browser-based photo cards with uploaded images, layered typography, live canvas preview, and local IndexedDB saving."
                route="/tools/photo-card"
                title="Photo Card Generator"
            />

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

            <PoweredBy
                description="This tool uses Locality class from my open-source package to handle IndexedDB operations efficiently."
                name="locality-idb"
                url="https://github.com/nazmul-nhb/locality-idb?tab=readme-ov-file"
            />
        </div>
    );
}
