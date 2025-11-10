import {Portal, Dialog, ActivityIndicator} from "react-native-paper";

export default function LoadingDialog({isLoading, onDismiss, color}) {
    return (
        <Portal>
            <Dialog visible={isLoading} onDismiss={onDismiss}>
                <Dialog.Content>
                    <ActivityIndicator animating={true} color={color}/>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );

}