import React from 'react';
import SaveToCollectionButton from '../SaveToCollection/SaveToCollectionButton';
import './BookmarkButton.css';

/**
 * BookmarkButton - обёртка над SaveToCollectionButton
 * в новом тёмном стиле с зелёным акцентом
 */
const BookmarkButton = ({ videoId, onAuthRequired, initialSaved = false }) => {
    return (
        <div className="bookmark-button-wrapper">
            <SaveToCollectionButton
                videoId={videoId}
                onAuthRequired={onAuthRequired}
                initialSaved={initialSaved}
                showText={false}
            />
        </div>
    );
};

export default BookmarkButton;
