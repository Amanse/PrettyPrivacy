import {Portal, Snackbar, useTheme} from "react-native-paper";

export default function SnackBar({visible, label, title, onDismissSnackBar, onPress}) {
    const theme = useTheme();

    return <Portal><Snackbar
        visible={visible}
        theme={theme}
        onDismiss={onDismissSnackBar}
        action={{
            label: label,
            onPress: onPress,
        }}>
        {title}
    </Snackbar></Portal>
}