import {
    RefreshCw,
    Trash2,
    Folder,
    Cpu,
    Globe,
    FileText,
    History,
    Clock,
    Wifi,
    Shield,
    Database,
    TrendingUp,
} from "lucide-react"

export const cleanupIconMap = {
    folder: <Folder className="text-blue-500" size={20} />,
    trash: <Trash2 className="text-red-500" size={20} />,
    cpu: <Cpu className="text-green-500" size={20} />,
    refresh: <RefreshCw className="text-purple-500" size={20} />,
    file: <FileText className="text-orange-500" size={20} />,
    globe: <Globe className="text-cyan-500" size={20} />,
    history: <History className="text-gray-500" size={20} />,
    clock: <Clock className="text-yellow-500" size={20} />,
    wifi: <Wifi className="text-blue-500" size={20} />,
    shield: <Shield className="text-green-500" size={20} />,
    shieldGreen: <Shield className="text-green-500" size={20} />,
    database: <Database className="text-red-500" size={20} />,
    databaseRed: <Database className="text-red-500" size={20} />,
    trending: <TrendingUp className="text-emerald-500" size={20} />,
}

export const categoryIconMap = {
    refresh: <RefreshCw size={16} />,
    cpu: <Cpu size={16} />,
    trending: <TrendingUp size={16} />,
    globe: <Globe size={16} />,
    shield: <Shield size={16} />,
    database: <Database size={16} />,
    wifi: <Wifi size={16} />,
}