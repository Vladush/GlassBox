import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        i18n.changeLanguage(e.target.value);
    };

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <select
                value={i18n.language.split('-')[0]}
                onChange={handleChange}
                className="px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
            >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
            </select>
        </div>
    );
}
