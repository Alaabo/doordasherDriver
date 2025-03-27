import { View, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthContext } from '@/lib/authContext'
import { getRequestByDriver } from '@/lib/appwrite'
import { RequestType } from '@/types/globals'
import { SafeAreaView } from 'react-native-safe-area-context'
import { t } from 'i18next'
import { router, usePathname } from 'expo-router'
import i18n from '@/utils/i18n'
import { Ionicons } from '@expo/vector-icons';
const Ride = () => {
    const{userData} = useAuthContext()
    const [requests, setRequests] = useState<RequestType[] | null>(null)
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const isRTL = false
    useEffect(() => {
        const fetchnear = async ()=>{
            try {
                const results = await getRequestByDriver(userData?.$id!)
                
                if (results instanceof Error) {
                  Alert.alert('error' , 'error happened while fetching location')
                } else {
                  //@ts-ignore
                  setRequests(results.documents!);
                }
          } catch (error) {
            Alert.alert('error' , 'Error Occured')
          } finally {
            setLoading(false)
          }
           }
      fetchnear()
       
    }, [pathname])
    const getStatusIcon = (status: string): { name: keyof typeof Ionicons.glyphMap, color: string } => {
        switch (status) {
          case 'pending':
            return { name: 'time-outline', color: '#FFC107' }; // Yellow
          case 'accepted':
            return { name: 'checkmark-circle-outline', color: '#2196F3' }; // Blue
          case 'onRoad':
            return { name: 'car-outline', color: '#9C27B0' }; // Purple
          case 'delivered':
            return { name: 'checkmark-done-circle-outline', color: '#4CAF50' }; // Green
          default:
            return { name: 'help-circle-outline', color: '#9E9E9E' }; // Grey
        }
      };
    
      
      const renderRequestItem = ({ item }: { item: RequestType }) => {
        const statusIcon = getStatusIcon(item.status);
        
        return (
          <TouchableOpacity
            style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,}}
            //@ts-ignore
            onPress={() => router.push(`/request/${item.$id}`)}
          >
            
            <View style={[styles.requestHeader]}>
              <Text style={styles.requestId}>#{item.$id!.slice(-4)}</Text>
              <View style={[styles.statusContainer, isRTL && styles.rowReverse]}>
                <Ionicons name={statusIcon.name} size={18} color={statusIcon.color} />
                <Text style={[
                  styles.statusText, 
                  { color: statusIcon.color },
                  isRTL && styles.statusTextRTL
                ]}>
                  {t(`request.status.${item.status}`)}
                </Text>
              </View>
            </View>
            
            <View style={styles.requestDetails}>
              <View style={[styles.detailRow, isRTL && styles.rowReverse , {display : 'flex' ,  justifyContent : 'space-between' , width : '100%' }]}>
                <Text style={[styles.detailLabel]}>{t('PackageDetails')}:</Text>
                <Text style={[styles.detailValue]}>{item.packageDetails}</Text>
              </View>
              
              <View style={[styles.detailRow, isRTL && styles.rowReverse]}>
                <Text style={[styles.detailLabel, isRTL && styles.textAlignRight]}>{t('price')}:</Text>
                <Text style={[styles.detailValue, isRTL && styles.textAlignRight]}>{item.price.toFixed(2)} {t('currency')}</Text>
              </View>
              
              {/* <View style={[styles.locationContainer, isRTL && styles.rowReverse]}>
                <View style={[styles.locationLine, isRTL && styles.locationLineRTL]}>
                  <View style={styles.locationDot} />
                  <View style={styles.locationDash} />
                  <View style={[styles.locationDot, styles.destinationDot]} />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={[styles.locationText, isRTL && styles.textAlignRight]} numberOfLines={1}>
                    {t('Pickup Location')}: {item.pickUpLan.toFixed(4)}, {item.pickUpLon.toFixed(4)}
                  </Text>
                  <Text style={[styles.locationText, isRTL && styles.textAlignRight]} numberOfLines={1}>
                    {t('Destination')}: {item.destinyLan.toFixed(4)}, {item.destinyLon.toFixed(4)}
                  </Text>
                </View>
              </View> */}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={[styles.userInfoText, isRTL && styles.textAlignRight]}>
                {t('user')}: {item.user}
                {item.driverid ? ` • ${t('request.driver')}: ${item.driverid}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        );
      };
    
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={styles.loadingText}>{t('Loading request details...')}</Text>
          </View>
        );
      }
    
      return (
        <View style={[styles.container, isRTL && styles.containerRTL]}>
          <Text style={{textAlign : 'center' ,  fontSize : 25 , margin : 20 }} className='font-Poppins-bold'>{t('My Active Deliveries')}</Text>
          
          {
            //@ts-ignore
          requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('Request not found')}</Text>
            </View>
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderRequestItem}
              contentContainerStyle={styles.listContainer}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              getItemLayout={(data, index) => ({
                length: 220, // Approximate height of each item
                offset: 220 * index,
                index,
              })}
              
            />
          )}
        </View>
      );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F5F5',
      padding: 16,
    },
    containerRTL: {
      // RTL specific container styles if needed
    },
    screenTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
      color: '#333',
    },
    listContainer: {
      paddingBottom: 16,
    },
   
    requestHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    requestId: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      marginLeft: 4,
      fontSize: 14,
      fontWeight: '500',
    },
    statusTextRTL: {
      marginLeft: 0,
      marginRight: 4,
    },
    requestDetails: {
        width: '100%' ,
      marginBottom: 12,
      justifyContent: 'space-between',
      alignItems: 'center',
      
    },
    detailRow: {
        width: '100%' ,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 14,
      color: '#666',
      width: 80,
    },
    detailValue: {
      fontSize: 14,
      color: '#333',
      fontWeight: '500',
      flex: 1,
    },
    locationContainer: {
      marginTop: 8,
      flexDirection: 'row',
    },
    locationLine: {
      width: 20,
      alignItems: 'center',
      marginRight: 8,
    },
    locationLineRTL: {
      marginRight: 0,
      marginLeft: 8,
    },
    locationDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#4CAF50',
    },
    destinationDot: {
      backgroundColor: '#F44336',
    },
    locationDash: {
      width: 2,
      height: 30,
      backgroundColor: '#CCCCCC',
      marginVertical: 4,
    },
    locationTextContainer: {
      flex: 1,
      justifyContent: 'space-between',
      height: 50,
    },
    locationText: {
      fontSize: 12,
      color: '#666',
    },
    userInfo: {
      borderTopWidth: 1,
      borderTopColor: '#EEE',
      paddingTop: 8,
    },
    userInfoText: {
      fontSize: 12,
      color: '#666',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: '#666',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
    // RTL specific styles
    rowReverse: {
      flexDirection: 'row-reverse',
    },
    textAlignRight: {
      textAlign: 'right',
    },
  });
  
export default Ride