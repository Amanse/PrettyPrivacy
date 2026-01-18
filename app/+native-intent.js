import {getShareExtensionKey} from "expo-share-intent";

export function redirectSystemPath({
                                       path,
                                       initial,
                                   }) {
    try {
        if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
            // redirect to the ShareIntent Screen to handle data with the hook
            console.debug(
                "[expo-router-native-intent] redirect to ShareIntent screen",
            );
            return "/";
        }
        return path;
    } catch {
        return "/";
    }
}