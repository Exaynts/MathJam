import React, { useState } from 'react';
import styles from './AdBanner.module.css';
import studentImage from './../../assets/images/studentLearning.PNG';

// Описать пропсы, которые принимает компонент
interface AdBannerProps {
    onHide?: () => void;
}

/**
 * Отрисовать рекламный баннер с возможностью отправки жалобы.
 */
const AdBanner = ({ onHide }: AdBannerProps): React.JSX.Element => {
    const [isFeedbackMode, setIsFeedbackMode] = useState<boolean>(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);

    /**
     * Обработать клик по меню и включить режим жалобы.
     */
    const handleMenuClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
        setIsFeedbackMode(true);
    };

    /**
     * Вернуться из режима жалобы в обычный режим.
     */
    const handleBack = (): void => {
        setIsFeedbackMode(false);
        setSelectedReason(null);
    };

    /**
     * Выбрать причину жалобы.
     */
    const handleReasonSelect = (reason: string): void => {
        setSelectedReason(reason);
    };

    /**
     * Отправить жалобу и скрыть баннер.
     */
    const handleSubmit = (): void => {
        if (selectedReason) {
            console.log('Complaint sent. Reason:', selectedReason);
            alert('Thanks for your feedback!');

            if (onHide) onHide();
            setIsFeedbackMode(false);
            setSelectedReason(null);
        }
    };

    /**
     * Закрыть режим жалобы.
     */
    const handleCloseFeedback = (): void => {
        setIsFeedbackMode(false);
        setSelectedReason(null);
    };

    return (
        <div className={`${styles.adBanner} ${isFeedbackMode ? styles.feedbackMode : ''}`}>
            {/* Обычный режим */}
            {!isFeedbackMode && (
                <>
                    <div className={styles.top}>
                        <img
                            src={studentImage}
                            alt="MathJam mathematics courses"
                            className={styles.image}
                        />
                        <div className={styles.badge}>Ads 0+</div>
                        <div className={styles.menu} onClick={handleMenuClick}>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                        </div>
                    </div>
                    <a
                        href="https://github.com/Exaynts/TermPaper2026"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.bottomContainer}
                    >
                        <div className={styles.bottom}>
                            <span className={styles.link}>
                                Buy math online courses from 0 rubles in MathJam
                            </span>
                            <div className={styles.arrowLink}>
                                <svg
                                    className={styles.arrow}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M5 12H19"
                                        stroke="#f55"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M12 5L19 12L12 19"
                                        stroke="#f55"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </a>
                </>
            )}

            {/* Режим обратной связи */}
            {isFeedbackMode && (
                <div className={styles.feedbackContent}>
                    <div className={styles.closeFeedback} onClick={handleCloseFeedback}>
                        <div className={styles.closeIcon}></div>
                    </div>
                    <div className={styles.feedbackTitle}>
                        Why don't you like advertising?
                    </div>
                    <div className={styles.feedbackButtons}>
                        <button
                            className={`${styles.feedbackButton} ${selectedReason === 'content' ? styles.selected : ''}`}
                            onClick={() => handleReasonSelect('content')}
                        >
                            Advertising obscures content
                        </button>
                        <button
                            className={`${styles.feedbackButton} ${selectedReason === 'interest' ? styles.selected : ''}`}
                            onClick={() => handleReasonSelect('interest')}
                        >
                            Not interested
                        </button>
                        <button
                            className={`${styles.feedbackButton} ${selectedReason === 'purchased' ? styles.selected : ''}`}
                            onClick={() => handleReasonSelect('purchased')}
                        >
                            The item was purchased
                        </button>
                        <button
                            className={`${styles.feedbackButton} ${selectedReason === 'other' ? styles.selected : ''}`}
                            onClick={() => handleReasonSelect('other')}
                        >
                            Other
                        </button>
                    </div>
                    <div className={styles.feedbackActions}>
                        <button className={styles.feedbackBack} onClick={handleBack}>
                            Back
                        </button>
                        <button
                            className={styles.feedbackSubmit}
                            onClick={handleSubmit}
                            disabled={!selectedReason}
                        >
                            Sent
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdBanner;