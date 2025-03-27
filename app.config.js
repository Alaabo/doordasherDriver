export default ({ config }) => ({
    expo: {
        name: "doordasherdriver",
        slug: "doordasherdriver",
        owner: "alaabourega",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/logo.png",
        scheme: "doordasherdriver",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        developmentClient: {
            silentLaunch: false
        },
        extra: {
            eas: {
                projectId: '5cb60471-f6cd-4df0-bbe6-6aa7fee2457f'
            },
            cli: {
                appVersionSource: "remote" // This addresses the first warning
            }
        },
        ios: {
            supportsTablet: true,
            config: {
                googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
            },
        },
        android: {
            package: "com.Alaabo.doordasherdriver", // This MUST be unique
            versionCode: 1,
            adaptiveIcon: {
                foregroundImage: "./assets/images/logo.png",
                backgroundColor: "#B5C8FF",
                googleServicesFile: false,
            },
            config: {
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
                }
            }
            ,
            intentFilters: [
                {
                    action: "VIEW",
                    data: [{ scheme: "doordasherdriver" }],
                    category: ["BROWSABLE", "DEFAULT"]
                }
            ]
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/logo.png",
        },
        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/logo.png",
                    resizeMode: "cover",
                    backgroundColor: "#ffffff",
                    enableFullScreenImage_legacy: true,
                },
            ],
            [
                "expo-font",
                {
                    fonts: [
                        "./assets/fonts/Poppins-Black.ttf",
                        "./assets/fonts/Poppins-Bold.ttf",
                        "./assets/fonts/Poppins-Light.ttf",
                        "./assets/fonts/Poppins-Thin.ttf",
                        "./assets/fonts/Poppins-Medium.ttf",
                        "./assets/fonts/Poppins-Regular.ttf",
                        "./assets/fonts/Poppins-SemiBold.ttf",
                    ],
                },
            ],
        ],
        experiments: {
            typedRoutes: true,
        },
    },
});
