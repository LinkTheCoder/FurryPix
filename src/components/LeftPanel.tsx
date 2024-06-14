/* eslint-disable @typescript-eslint/naming-convention */

interface LeftPanelProp {
    message: string;
    additionalText: string;
    imageUri?: string; // Optional prop for the image URI
}

function LeftPanel({
    message,
    additionalText,
    imageUri
}: LeftPanelProp) {
    return (
        <div className='panel-wrapper'>
            <span className='panel-info'>{message}</span>
            {imageUri && <img src={imageUri} alt='Description of the image' className='panel-image' />}
            <div className='additional-text'>
                {additionalText}
            </div>
        </div>
    );
}

export default LeftPanel;
