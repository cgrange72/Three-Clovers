import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Comments: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Comments Screen</Text>
            {/* Add more UI components here as needed */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default Comments;

