import { useAuthContext } from '@/lib/authContext';
import { Image, StyleSheet, Platform, Text, TouchableOpacity, Alert, Dimensions, ScrollView, FlatList, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Callout, Marker } from 'react-native-maps'
import { router, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import i18next, { t } from 'i18next';
import { RequestType } from '@/types/globals';
import { getNearby } from '@/lib/appwrite';
import { useLocationContext } from '@/lib/locationContxt';
import { images } from '@/constants';


export default function HomeScreen() {
  const {logout , userData} = useAuthContext()
  const {location} = useLocationContext()
  const pathname = usePathname();
  const {width , height} = Dimensions.get('screen')
  const [isRTL , setIsRTL] = useState<boolean>(false)
  const [request, setRequest] = useState<RequestType[] >([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([])
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  })
  const [selecteditem, setSelectedItem] = useState<RequestType | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false)
  useEffect(() => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.002, // Zoom in more
        longitudeDelta: 0.002,
      }, 1000); // Animation duration in ms
    }
  }, [location]);
  useEffect(() => {
      // Check if current language is Arabic to set RTL
      const currentLanguage = i18next.language;
      
      const isArabicLanguage = currentLanguage === 'ar';
      setIsRTL(isArabicLanguage);
      
      const fetchnear = async ()=>{
        const results = await getNearby(location)
        
        if (results instanceof Error) {
          Alert.alert('error' , 'error happened while fetching location')
        } else {
          //@ts-ignore
          setRequest(results.documents!);
        }
      }
      setRegion({
        latitude : location.latitude,
        longitude : location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      })
      
      fetchnear()
    }, [pathname , location]);
   
    
  return (
    <>
      <MapView 
      ref={mapRef}
      style={{
        width : width ,
        height : height*0.95
      }}
      initialRegion={region}
      >
        {request.map((item)=>{
          return(
            <Marker
            key={item.$id}
            coordinate={{
              latitude: item.pickUpLan,
              longitude: item.pickUpLon,
            }}
            pinColor="#2ecc71"
            title={item.price.toString()}
            description={t('Package pickup point')}
            onPress={()=>{setSelectedItem(item) ; setIsVisible(true)}}
            />
           
          )
        })}
        <Marker coordinate={location} pinColor='black' description={t('you are here')}/>
        </MapView>
    
     <View style={{ backgroundColor : 'rgba(34, 150, 94, 0.5)' , borderRadius: 50 , padding: 5 ,  position : 'absolute' , top : 40 ,  left:10 , right : 10 , justifyContent: 'space-between' , display : 'flex' , flexDirection : 'row' , alignItems : 'center'}} >
      <TouchableOpacity onPress={()=> router.push('/(root)/profile')} className='p-4'>
        <Image style={{ width : 32 , height : 32}} source={images.user}/>
      </TouchableOpacity>
      <View>
      <Text className='text-2xl text-center font-Poppins-medium '>{t('welcomeBack')}</Text>
      <Text className='text-2xl text-center font-Poppins-bold '>{userData?.name}</Text>
      </View>
      <TouchableOpacity onPress={()=> router.push('/ride')} className='p-4'>
        <Image style={{ width : 32 , height : 32}} source={images.delivery}/>
      </TouchableOpacity>
     </View>
      <Modal
      visible={isVisible}
      animationType='slide'
      transparent
      onRequestClose={()=>{setIsVisible(false)}}
      >
        <View style={{width : width , height : 500 , backgroundColor : 'rgba(34, 150, 94, 0.9)' , padding : 10 , borderTopLeftRadius : 50 , borderTopRightRadius : 50 ,position : 'absolute' , bottom : 0}}>
            <View style={{ display: 'flex', alignItems: 'center', width: '100%', flexDirection: `${isRTL ? 'row-reverse' : 'row'}`, justifyContent: 'space-between', padding: 10 }}>
              <TouchableOpacity
                style={{ display: "flex", flexDirection: 'row', alignItems: 'center', padding: 3, backgroundColor: 'white', borderRadius: 30 }}
                onPress={() => setIsVisible(false)}
              >

                <Image
                  style={{ width: 32, height: 32 }}
                  source={images.close}

                />
                <Text className='text-2xl font-Poppins-bold'>{t('close')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ display: "flex", flexDirection: 'row', alignItems: 'center', padding: 3, backgroundColor: 'white', borderRadius: 30 }}
                //@ts-ignore
                onPress={() => router.replace(`/request/${selecteditem?.$id}`)}
              >
                <Image
                  style={{ width: 32, height: 32 }}
                  source={images.area}
                  tintColor={'black'}

                />
                <Text className='text-2xl font-Poppins-bold'>{t('ShowMore')}</Text>

              </TouchableOpacity>

            </View>
            <View style={{padding : 10 , backgroundColor : 'white' , borderRadius : 30 , display : 'flex' , alignItems : 'center'}}>
              <View style={{width : '100%' , margin : 20 , display : 'flex', flexDirection : `${isRTL ? 'row-reverse' : 'row'}` , justifyContent : 'space-between'}}>
                <Text className='font-Poppins-medium'>{t('PackageDetails')}</Text>
                <Text className='font-Poppins-bold' >{selecteditem?.packageDetails}</Text>
              </View>
              <View style={{width : '90%' , borderBlockColor : 'black' , borderBottomWidth : 3 , borderStyle : 'dotted'}}/>
              <View style={{width : '100%' ,margin : 20 , display : 'flex', flexDirection : `${isRTL ? 'row-reverse' : 'row'}` , justifyContent : 'space-between'}}>
                <Text className='font-Poppins-medium'>{t('price')}</Text>
                <Text className='font-Poppins-bold' >{selecteditem?.price} {t('currency')}</Text>
              </View>
            </View>
             {/* Location Details */}
             <View style={styles.card}>
              <Text style={[styles.cardTitle , isRTL && {textAlign : 'left'}]}>{t('Location Details')}</Text>
              <View style={styles.locationContainer}>
                <View style={[styles.locationItem]}>
                  <View style={[styles.locationDot, isRTL && styles.locationDotRtl]} />
                  <View style={[styles.locationTextContainer, isRTL && styles.locationTextContainerRtl]}>
                    <Text style={[styles.locationLabel]}>{t('Pickup Location')}</Text>
                    <Text style={[styles.locationCoordinates]}>
                      {selecteditem?.pickUpLan.toFixed(6)}, {selecteditem?.pickUpLon.toFixed(6)}
                    </Text>
                  </View>
                </View>
                <View style={{width : '90%' , borderBlockColor : 'black' , borderBottomWidth : 3 , borderStyle : 'dotted'}}/>
             
                
                
                <View style={[styles.locationItem]}>
                  <View style={[styles.locationDot, styles.destinationDot, isRTL && styles.locationDotRtl]} />
                  <View style={[styles.locationTextContainer, isRTL && styles.locationTextContainerRtl]}>
                    <Text style={[styles.locationLabel]}>{t('Destination')}</Text>
                    <Text style={[styles.locationCoordinates]}>
                      {selecteditem?.destinyLan.toFixed(6)}, {selecteditem?.destinyLon.toFixed(6)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
        </View>
      </Modal>
    </>

  );
}

const styles = StyleSheet.create({
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e74c3c',
    marginRight: 12,
  },
  locationDotRtl: {
    marginRight: 0,
    marginLeft: 12,
  },
  destinationDot: {
    backgroundColor: '#2ecc71',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTextContainerRtl: {
    alignItems: 'flex-end',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  locationCoordinates: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  locationDivider: {
    height: 20,
    width: 1,
    backgroundColor: '#bdc3c7',
    marginLeft: 6,
    marginVertical: 4,
  },
  locationDividerRtl: {
    marginLeft: 0,
    marginRight: 6,
  },
  locationContainer: {
    paddingVertical: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 35,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1
  },
  map: {
    width: '100%',
    height: '100%'
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 200
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5
  },
  calloutDescription: {
    fontSize: 14,
    color: 'gray'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
