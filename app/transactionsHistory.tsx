import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  I18nManager
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Transaction } from '@/types/globals';
import { useAuthContext } from '@/lib/authContext';
import { router, usePathname } from 'expo-router';
import { getAllTransactions } from '@/lib/appwrite';
import { SafeAreaView } from 'react-native-safe-area-context';


const TransactionHistoryScreen = () => {
  const { t, i18n } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const {userData} = useAuthContext();
  const pathname = usePathname();
  const isRTL = i18n.language === 'ar' || i18n.dir() === 'rtl';

  useEffect(() => {
    // Replace with your actual API call
    const fetchTransactions = async () => {
      try {
       const results = await getAllTransactions(userData?.$id!)
       if(results){
         setTransactions(results.map(result => ({
            ...result,
            status: result.status,
            user: result.user,
            amount: result.amount,
            createdAt: result.createdAt,
            request: result.request,
            driver: result.driver
          })));
       } 
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [pathname]);

  const getStatusColor = (status : string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50'; // Green
      case 'pending':
        return '#FFC107'; // Yellow
      case 'failed':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        //@ts-ignore
        onPress={() => router.push(`/request/${item.request}`)}
      >
        <View style={[styles.transactionHeader, isRTL && styles.rowReverse]}>
          <Text style={styles.transactionId}>#{item.$id.slice(-4)}</Text>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(item.status) }
            ]}
          >
            <Text style={styles.statusText}>
              {t(`transaction.status.${item.status}`)}
            </Text>
          </View>
        </View>
        
        <View style={styles.transactionDetails}>
          <View style={[styles.detailRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.detailLabel, isRTL && styles.textAlignRight]}>{t('transaction.amount')}:</Text>
            <Text style={[styles.detailValue, isRTL && styles.textAlignRight]}>${item.amount.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.detailRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.detailLabel, isRTL && styles.textAlignRight]}>{t('transaction.date')}:</Text>
            <Text style={[styles.detailValue, isRTL && styles.textAlignRight]}>
              {format(new Date(item.createdAt), 'PPp')}
            </Text>
          </View>
          
          <View style={[styles.detailRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.detailLabel, isRTL && styles.textAlignRight]}>{t('transaction.request')}:</Text>
            <Text style={[styles.detailValue, isRTL && styles.textAlignRight]}>{item.request}</Text>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userInfoText, isRTL && styles.textAlignRight]}>
            {t('transaction.from')}: {item.user} • {t('transaction.to')}: {item.driver}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isRTL && styles.containerRTL]}>
      <Text style={{}} className='text-center font-Poppins-bold text-4xl m-4'>{t('transaction.history')}</Text>
      
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('transaction.noTransactions')}</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.$id}
          renderItem={renderTransactionItem}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          getItemLayout={(data, index) => ({
            length: 180, // Approximate height of each item
            offset: 180 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
};

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
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
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

export default TransactionHistoryScreen;


// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   FlatList, 
//   TouchableOpacity, 
//   StyleSheet, 
//   ActivityIndicator 
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { useTranslation } from 'react-i18next';
// import { format } from 'date-fns';
// import { Transaction } from '@/types/globals';
// import { useAuthContext } from '@/lib/authContext';
// import { router, usePathname } from 'expo-router';
// import { getAllTransactions } from '@/lib/appwrite';


// const TransactionHistoryScreen = () => {
//   const { t } = useTranslation();
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const {userData} = useAuthContext()
//     const pathname = usePathname();

//   useEffect(() => {
//     // Replace with your actual API call
//     const fetchTransactions = async () => {
//       try {
//        const results = await getAllTransactions(userData?.$id!)
//        if(results){
//          setTransactions(results.map(result => ({
//             ...result,
//             status: result.status,
//             user: result.user,
//             amount: result.amount,
//             createdAt: result.createdAt,
//             request: result.request,
//             driver: result.driver
//           })));
//        } 
//       } catch (error) {
//         console.error('Error fetching transactions:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTransactions();
//   }, [pathname]);

  

//   const getStatusColor = (status : string) => {
//     switch (status) {
//       case 'completed':
//         return '#4CAF50'; // Green
//       case 'pending':
//         return '#FFC107'; // Yellow
//       case 'failed':
//         return '#F44336'; // Red
//       default:
//         return '#9E9E9E'; // Grey
//     }
//   };

//   const renderTransactionItem = ({ item }: { item: Transaction }) => {
//     return (
//       <TouchableOpacity
//         style={styles.transactionItem}
//         onPress={() => router.push(`/request/${item.request}`)}
//       >
//         <View style={styles.transactionHeader}>
//           <Text style={styles.transactionId}>#{item.$id.slice(-4)}</Text>
//           <View 
//             style={[
//               styles.statusBadge, 
//               { backgroundColor: getStatusColor(item.status) }
//             ]}
//           >
//             <Text style={styles.statusText}>
//               {t(`transaction.status.${item.status}`)}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.transactionDetails}>
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>{t('transaction.amount')}:</Text>
//             <Text style={styles.detailValue}>${item.amount.toFixed(2)}</Text>
//           </View>
          
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>{t('transaction.date')}:</Text>
//             <Text style={styles.detailValue}>
//               {format(new Date(item.createdAt), 'PPp')}
//             </Text>
//           </View>
          
//           <View style={styles.detailRow}>
//             <Text style={styles.detailLabel}>{t('transaction.request')}:</Text>
//             <Text style={styles.detailValue}>{item.request}</Text>
//           </View>
//         </View>
        
//         <View style={styles.userInfo}>
//           <Text style={styles.userInfoText}>
//             {t('transaction.from')}: {item.user} • {t('transaction.to')}: {item.driver}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0066CC" />
//         <Text style={styles.loadingText}>{t('common.loading')}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.screenTitle}>{t('transaction.history')}</Text>
      
//       {transactions.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>{t('transaction.noTransactions')}</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={transactions}
//           keyExtractor={(item) => item.$id}
//           renderItem={renderTransactionItem}
//           contentContainerStyle={styles.listContainer}
//           initialNumToRender={10}
//           maxToRenderPerBatch={10}
//           windowSize={5}
//           getItemLayout={(data, index) => ({
//             length: 180, // Approximate height of each item
//             offset: 180 * index,
//             index,
//           })}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//     padding: 16,
//   },
//   screenTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   listContainer: {
//     paddingBottom: 16,
//   },
//   transactionItem: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   transactionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   transactionId: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   transactionDetails: {
//     marginBottom: 12,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     marginBottom: 6,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#666',
//     width: 80,
//   },
//   detailValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '500',
//     flex: 1,
//   },
//   userInfo: {
//     borderTopWidth: 1,
//     borderTopColor: '#EEE',
//     paddingTop: 8,
//   },
//   userInfoText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#666',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//   },
// });

// export default TransactionHistoryScreen;