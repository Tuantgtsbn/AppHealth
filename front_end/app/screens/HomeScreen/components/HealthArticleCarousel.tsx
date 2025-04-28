import { fetchArticles } from '@/redux/articleSlice';
import { RootState } from '@/redux/store';
import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Linking
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useDispatch, useSelector } from 'react-redux';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;
type Article = {
    title: string;
    summary: string;
    thumbnail: string;
    timePublish: string;
    link: string;
};
const HealthArticleCarousel = () => {
    const dispatch = useDispatch();
    const { loading, error, articles } = useSelector(
        (state: RootState) => state.article
    );
    const width = WINDOW_WIDTH * 0.85;
    const height = WINDOW_HEIGHT * 0.35;
    useEffect(() => {
        async function fetchData() {
            try {
                await dispatch(fetchArticles()).unwrap();
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, [dispatch]);
    const renderItem = ({ item, index }: { item: Article; index: number }) => {
        return (
            <TouchableOpacity
                style={[styles.card, { width: width - 20 }]} // -20 for margins
                onPress={() => {
                    /* Navigate to article detail */
                    Linking.openURL(item.link);
                }}
                activeOpacity={0.9}
            >
                <Image source={{ uri: item.thumbnail }} style={styles.image} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.timePublish}</Text>

                    <Text style={styles.description} numberOfLines={2}>
                        {item.summary}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Bài viết về sức khỏe</Text>
            {loading ? (
                <View className='h-[300px] justify-center items-center'>
                    <ActivityIndicator size='large' color='#FF4757' />
                </View>
            ) : articles.length > 0 ? (
                <View className='justify-center items-center'>
                    <Carousel
                        loop
                        width={width}
                        height={height}
                        data={articles}
                        renderItem={renderItem}
                        autoPlay={true}
                        autoPlayInterval={3000}
                        mode='parallax'
                        modeConfig={{
                            parallaxScrollingScale: 0.9,
                            parallaxScrollingOffset: 50
                        }}
                        scrollAnimationDuration={1000}
                    />
                </View>
            ) : (
                <Text>Không có bài viết nào</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        marginLeft: 20,
        color: '#333'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
        margin: 10
    },
    image: {
        width: '100%',
        height: 150,
        resizeMode: 'cover'
    },
    textContainer: {
        padding: 15
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20
    }
});

export default HealthArticleCarousel;
