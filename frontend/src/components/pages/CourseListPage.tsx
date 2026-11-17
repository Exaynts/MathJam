import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import CourseCard from '../courses/CourseCard';
import CourseFilters from '../courses/CourseFilters';
import { Course } from '../../types';
import styles from '../../styles/pages/CourseListPage.module.css';

const PAGE_SIZE = 5;

/**
 * Отрисовать страницу со списком и фильтрацией курсов.
 */
const CourseListPage = (): React.JSX.Element => {
    // Общие состояния
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Состояния фильтров
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [priceMin, setPriceMin] = useState<string>('');
    const [priceMax, setPriceMax] = useState<string>('');
    const [hasDiscount, setHasDiscount] = useState<boolean>(false);
    const [ratingMin, setRatingMin] = useState<string>('');
    const [ratingMax, setRatingMax] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('');

    // Состояния пагинации
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    /**
     * Сбросить пагинацию.
     */
    const resetPagination = (): void => {
        setCourses([]);
        setCurrentPage(1);
        setTotalPages(1);
    };

    /**
     * Загрузить курсы (append – добавить, false – заменить).
     */
    const loadCourses = useCallback(async (page: number = 1, append: boolean = false): Promise<void> => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (priceMin) params.append('price_min', priceMin);
            if (priceMax) params.append('price_max', priceMax);
            if (hasDiscount) params.append('has_discount', 'true');
            if (ratingMin) params.append('rating_min', ratingMin);
            if (ratingMax) params.append('rating_max', ratingMax);
            if (selectedCategories.length) {
                params.append('categories', selectedCategories.join(','));
            }

            let ordering = '';
            if (sortBy === 'price_asc') ordering = 'price';
            else if (sortBy === 'price_desc') ordering = '-price';
            else if (sortBy === 'rating') ordering = '-rating';
            else if (sortBy === 'newest') ordering = '-created_at';
            if (ordering) params.append('ordering', ordering);

            params.append('page', page.toString());
            params.append('page_size', PAGE_SIZE.toString());

            const response = await api.get<{ results: Course[], count: number }>(`/courses/?${params.toString()}`);
            const data = response.data.results;
            const count = response.data.count;
            const total = Math.ceil(count / PAGE_SIZE);

            setTotalPages(total);

            if (append) {
                setCourses(prev => [...prev, ...data]);
            } else {
                setCourses(data);
            }
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, priceMin, priceMax, hasDiscount, ratingMin, ratingMax, selectedCategories, sortBy]);

    /**
     * Применить фильтры и поиск.
     */
    const performFiltering = useCallback((): void => {
        resetPagination();
        loadCourses(1, false);
    }, [loadCourses]);

    /**
     * Обработать изменение выбранных категорий.
     */
    const handleCategoryChange = useCallback((categoryId: number): void => {
        setSelectedCategories(prev =>
            prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
        );
    }, []);

    /**
     * Обработать отправку формы поиска.
     */
    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        performFiltering();
    };

    /**
     * Сбросить все фильтры.
     */
    const resetFilters = (): void => {
        setSelectedCategories([]);
        setPriceMin('');
        setPriceMax('');
        setHasDiscount(false);
        setRatingMin('');
        setRatingMax('');
        setSortBy('');
        setSearchTerm('');
        performFiltering();
    };

    /**
     * Переключиться на определённую страницу.
     */
    const goToPage = (page: number): void => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        loadCourses(page, false);
    };

    /**
     * Загрузить следующую страницу (кнопка "Load more").
     */
    const loadMore = (): void => {
        const nextPage = currentPage + 1;
        if (nextPage <= totalPages) {
            setCurrentPage(nextPage);
            loadCourses(nextPage, true);
        }
    };

    // Сбросить пагинацию и загрузить первую страницу при изменении фильтров
    useEffect(() => {
        performFiltering();
    }, [searchTerm, priceMin, priceMax, hasDiscount, ratingMin, ratingMax, selectedCategories, sortBy, performFiltering]);

    // Загрузить курсы изначально
    useEffect(() => {
        loadCourses(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Отрисовать блок с кнопками пагинации.
     */
    const renderPagination = (): React.JSX.Element | null => {
        if (totalPages <= 1) return null;
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) pages.push(i);

        return (
            <div className={styles.pagination}>
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={styles.pageButton}>
                    Previous
                </button>
                {pages.map(p => (
                    <button key={p} onClick={() => goToPage(p)} className={`${styles.pageButton} ${p === currentPage ? styles.activePage : ''}`}>
                        {p}
                    </button>
                ))}
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className={styles.pageButton}>
                    Next
                </button>
            </div>
        );
    };

    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.pageContainer}>
            <CourseFilters
                selectedCategories={selectedCategories}
                priceMin={priceMin}
                priceMax={priceMax}
                hasDiscount={hasDiscount}
                ratingMin={ratingMin}
                ratingMax={ratingMax}
                sortBy={sortBy}
                onCategoryChange={handleCategoryChange}
                onPriceMinChange={setPriceMin}
                onPriceMaxChange={setPriceMax}
                onHasDiscountChange={setHasDiscount}
                onRatingMinChange={setRatingMin}
                onRatingMaxChange={setRatingMax}
                onSortChange={setSortBy}
                onResetFilters={resetFilters}
                onApplyFilters={performFiltering}
            />
            <div className={styles.content}>
                <div className={styles.searchBar}>
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchBtn}>🔍</button>
                    </form>
                </div>
                <div className={styles.courseList}>
                    {courses.length === 0 && !loading && <p className={styles.noCourseFound}>No courses found</p>}
                    {courses.map(course => (
                        <CourseCard key={course.course_id} course={course} />
                    ))}
                    {loading && <div className={styles.loading}>Loading...</div>}
                    {!loading && totalPages > 1 && currentPage < totalPages && (
                        <button onClick={loadMore} className={styles.loadMoreButton}>
                            Load more
                        </button>
                    )}
                    {renderPagination()}
                </div>
            </div>
        </div>
    );
};

export default CourseListPage;