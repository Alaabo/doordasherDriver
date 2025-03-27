import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { t } from "i18next";
import { router } from "expo-router";
export interface LocationProp {
    latitude: number;
    longitude: number;
}
interface LocationContextProps {
    location: LocationProp,
    locationLoading: boolean,
    locationError: string | null ,
    getLocation : () => Promise<void>
}
interface LocationProviderProps {
    children: ReactNode;
}

const LocationContext = createContext<LocationContextProps | null>(null)

export const LocationProvider = ({ children }: LocationProviderProps) => {

    const [location, setLocation] = useState<LocationProp>({ latitude: 0, longitude: 0 });
    const [locationLoading, setLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    const getLocation = async () => {
        try {
            setLocationLoading(true);
            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setLocationError("Location permission not granted");
                Alert.alert(
                    t("Location Required"),
                    t( "This app requires location access to function properly. Please enable location services in your settings."),
                    [
                        {
                            text: t( "Try Again"),
                            onPress: () => getLocation()
                        }
                    ]
                );
                return;
            }

            // Fetch location
            const userLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setLocation({
                longitude: userLocation.coords.longitude,
                latitude: userLocation.coords.latitude
            });
            setLocationError(null);
        } catch (error) {
            setLocationError(error instanceof Error ? error.message : "Unknown location error");
            Alert.alert(
                "Location Error",
                "Failed to get your location. Please try again.",
                [
                    {
                        text: "Retry",
                        onPress: () => getLocation()
                    }
                ]
            );
        } finally {
            setLocationLoading(false);
        }
    };


    useEffect(() => {
        getLocation();
    }, []);

    return (
        <LocationContext.Provider
            value={
                {
                    location,
                    locationLoading,
                    locationError,
                    getLocation
                }
            }
        >
            {children}
        </LocationContext.Provider>
    )
}


export const useLocationContext = (): LocationContextProps => {
    const context = useContext(LocationContext);
    if (!context)
        throw new Error("Location Provider must be used within a GlobalProvider");

    return context;
};