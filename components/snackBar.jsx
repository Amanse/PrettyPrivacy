import React from 'react';
import NativeSnackbar from './ui/NativeSnackbar';

export default function SnackBar({ visible, label, title, onDismissSnackBar, onPress }) {
    return (
        <NativeSnackbar
            visible={visible}
            onDismiss={onDismissSnackBar}
            action={label ? { label, onPress } : null}
        >
            {title}
        </NativeSnackbar>
    );
}
