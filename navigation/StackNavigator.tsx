import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import Comments from '../screens/Comments'; // Remove the file extension

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Comments" component={Comments} /> // Define the Comments route
    </Stack.Navigator>
  );
};

export default AppNavigator;
