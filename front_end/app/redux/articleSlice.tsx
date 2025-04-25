import { db } from '@config/firebase';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';

export const fetchArticles = createAsyncThunk(
    'article/fetchArticles',
    async (_, { rejectWithValue }) => {
        try {
            const ref = collection(db, 'Articles');
            const snapshot = await getDocs(ref);
            const articles = snapshot.docs.map((doc) => {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            });
            return articles;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const articleSlice = createSlice({
    name: 'article',
    initialState: {
        articles: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchArticles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchArticles.fulfilled, (state, action) => {
                state.loading = false;
                state.articles = action.payload;
            })
            .addCase(fetchArticles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});
export default articleSlice.reducer;
