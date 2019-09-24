/**
 * index.js
 *
 * Starting point of the app.
 */

/**
 * Importing modules.
 */
import {
    /* eslint-disable no-unused-vars */
    App,
    Box,
    Button,
    Checkbox,
    Form,
    Group,
    Picker,
    ProgressBar,
    RadioButtons,
    Separator,
    TextInput,
    Window,
    render
} from 'proton-native';
import React, {Component} from 'react';
/* eslint-enable no-unused-vars */
import UploaderApi from './api.js';
import Wiki from './wiki.js';
import pkg from './package.json';

/**
 * Constants.
 */
const DEFAULT_EXCLUDE_IMAGES = [
    'File:Community-header-background',
    'File:Community-Page-Header.jpg',
    'File:Favicon.ico',
    'File:Wiki.png',
    'File:Wiki-background',
    'File:Wiki-wordmark.png'
];

/* eslint-disable no-unused-vars */
/**
 * Base application component.
 */
class Base extends Component {
    /* eslint-enable no-unused-vars */
    /**
     * Component constructor.
     * @param {Array} props Component props
     */
    constructor(props) {
        super(props);
        this.state = {
            contents: '',
            ignoreWarnings: true,
            imageList: '',
            imageListMethod: 0,
            logs: [
                `${pkg.name} v${pkg.version}: ${pkg.description}`
            ],
            password: '',
            progress: 0,
            running: false,
            stopping: false,
            summary: '',
            username: '',
            watchlist: 'preferences',
            wikiFrom: '',
            wikiTo: ''
        };
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeWikiFrom = this.onChangeWikiFrom.bind(this);
        this.onChangeWikiTo = this.onChangeWikiTo.bind(this);
        this.onChangeListMethod = this.onChangeListMethod.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.toggleWarnings = this.toggleWarnings.bind(this);
        this.onChangeImageList = this.onChangeImageList.bind(this);
        this.onChangeSummary = this.onChangeSummary.bind(this);
        this.onChangeContents = this.onChangeContents.bind(this);
        this.onChangeWatchlist = this.onChangeWatchlist.bind(this);
    }
    /* eslint-disable max-lines-per-function */
    /**
     * Renders the component.
     * @returns {Component} The rendered component
     */
    render() {
        const isStartButtonEnabled = Boolean(
            this.state.username &&
            this.state.password &&
            this.state.wikiFrom &&
            this.state.wikiTo &&
            !this.state.stopping
        ), isStartButtonVisible = !this.state.running || this.state.stopping;
        return (
            <App>
                <Window
                    title="Fandom Image Transfer"
                    menuBar={false}
                    size={{
                        h: 720,
                        w: 1280
                    }}
                >
                    <Box padded vertical={false}>
                        <Box padded>
                            <Group title="Required" margined>
                                <Form>
                                    <TextInput
                                        label="Username"
                                        stretchy={false}
                                        onChange={this.onChangeUsername}
                                    />
                                    <TextInput
                                        label="Password"
                                        secure
                                        stretchy={false}
                                        onChange={this.onChangePassword}
                                    />
                                    <TextInput
                                        label="Wiki to transfer from"
                                        stretchy={false}
                                        onChange={this.onChangeWikiFrom}
                                    />
                                    <TextInput
                                        label="Wiki to transfer to"
                                        stretchy={false}
                                        onChange={this.onChangeWikiTo}
                                        />
                                </Form>
                            </Group>
                            <Separator stretchy={false} />
                            <Group title="Basic Options" margined>
                                <Form>
                                    <RadioButtons
                                        label="Images to transfer"
                                        stretchy={false}
                                        onSelect={this.onChangeListMethod}
                                    >
                                        <RadioButtons.Item>
                                            Exclude specified images
                                        </RadioButtons.Item>
                                        <RadioButtons.Item>
                                            Only include specified images
                                        </RadioButtons.Item>
                                    </RadioButtons>
                                    <Checkbox
                                        checked={this.state.ignoreWarnings}
                                        stretchy={false}
                                        onToggle={this.toggleWarnings}
                                    >
                                        Ignore warnings
                                    </Checkbox>
                                    <TextInput
                                        label="Image list"
                                        multiline
                                        onChange={this.onChangeImageList}
                                    >
                                        {DEFAULT_EXCLUDE_IMAGES.join('\n')}
                                    </TextInput>
                                </Form>
                            </Group>
                            <Button
                                enabled={isStartButtonEnabled}
                                visible={isStartButtonVisible}
                                stretchy={false}
                                onClick={this.start}
                            >
                                Start
                            </Button>
                            <Button
                                visible={!isStartButtonVisible}
                                stretchy={false}
                                onClick={this.stop}
                            >
                                Stop
                            </Button>
                            <Separator stretchy={false} />
                            <Group title="Advanced Options" margined>
                                <Form>
                                    <TextInput
                                        label="Summary"
                                        stretchy={false}
                                        onChange={this.onChangeSummary}
                                    />
                                    <TextInput
                                        label="Contents"
                                        multiline
                                        onChange={this.onChangeContents}
                                    />
                                    <Picker
                                        label="Watchlist"
                                        stretchy={false}
                                        onSelect={this.onChangeWatchlist}
                                        selected={0}
                                    >
                                        <Picker.Item>
                                            As set in preferences
                                        </Picker.Item>
                                        <Picker.Item>
                                            Add uploaded files to watchlist
                                        </Picker.Item>
                                        <Picker.Item>
                                            Don't change the watchlist
                                        </Picker.Item>
                                    </Picker>
                                </Form>
                            </Group>
                        </Box>
                        <Box padded>
                            <TextInput
                                enabled={false}
                                readOnly
                                multiline
                            >
                                {this.state.logs.join('\n')}
                            </TextInput>
                            <ProgressBar
                                value={this.state.progress}
                                stretchy={false}
                            />
                        </Box>
                    </Box>
                </Window>
            </App>
        );
    }
    /* eslint-enable max-lines-per-function */
    /**
     * Event handler for changing the username field.
     * @param {string} username Entered username
     */
    onChangeUsername(username) {
        this.setState({username});
    }
    /**
     * Event handler for changing the password field.
     * @param {string} password Entered password
     */
    onChangePassword(password) {
        this.setState({password});
    }
    /**
     * Event handler for changing the URL to the wiki that images are
     * being transferred from.
     * @param {string} wikiFrom Entered wiki URL
     */
    onChangeWikiFrom(wikiFrom) {
        if (Wiki.validate(wikiFrom)) {
            this.setState({wikiFrom});
        } else {
            this.setState({
                wikiFrom: false
            });
        }
    }
    /**
     * Event handler for changing the URL to the wiki that images are
     * being transferred to.
     * @param {string} wikiTo Entered wiki URL
     */
    onChangeWikiTo(wikiTo) {
        if (Wiki.validate(wikiTo)) {
            this.setState({wikiTo});
        } else {
            this.setState({
                wikiTo: false
            });
        }
    }
    /**
     * Event handler for when the ignore warnings checkbox is toggled.
     * @param {bool} ignoreWarnings Whether to ignore upload warnings
     */
    toggleWarnings(ignoreWarnings) {
        this.setState({ignoreWarnings});
    }
    /**
     * Event handler after selecting the image listing option.
     * @param {number} index Index of the checkbox
     */
    onChangeListMethod(index) {
        this.setState({
            imageListMethod: index
        });
    }
    /**
     * Event handler after the list of images has been updated.
     * @param {string} list The list of images
     */
    onChangeImageList(list) {
        this.setState({
            imageList: list
                .trim()
                .split('\n')
                .map(el => el.includes(':') ?
                    el :
                    `File:${el}`
                )
        });
    }
    /**
     * Event handler after the file upload summary changes.
     * @param {string} summary The file upload summary
     */
    onChangeSummary(summary) {
        this.setState({summary});
    }
    /**
     * Event handler after the file contents change.
     * @param {string} contents The file upload contents
     */
    onChangeContents(contents) {
        this.setState({contents});
    }
    /**
     * Event handler after changing the watchlist option.
     * @param {number} watchlist Selected option index
     */
    onChangeWatchlist(watchlist) {
        this.setState({
            watchlist: watchlist === 0 ?
                'preferences' :
                watchlist === 1 ?
                    'watch' :
                    'nochange'
        });
    }
    /**
     * Logs text to console and UI.
     * @param {string} text Text to log
     */
    log(text) {
        console.info(text);
        this.setState(prevState => ({
            logs: [...prevState.logs, text]
        }));
    }
    /**
     * Gets images for uploading.
     * @param {UploaderApi} uploader Uploader API client instance
     * @returns {Promise<Array<Image>>} The image list
     */
    async getImages(uploader) {
        if (this.state.imageListMethod === 0) {
            return (await uploader.listAll())
                .filter(image => !this.state.imageList.includes(image.title));
        }
        return uploader.listSome(this.state.imageList);
    }
    /**
     * Initiates the upload for a single image.
     * @param {Image} image Image being uploaded
     * @param {UploaderApi} uploader Uploader API client instance
     */
    async uploadImage(image, uploader) {
        const uploadResult = (await uploader.upload(image, {
            comment: this.state.summary,
            ignoreWarnings: this.state.ignoreWarnings,
            text: this.state.contents,
            watchlist: this.state.watchlist
        })).data;
        if (uploadResult.error) {
            this.log(`ERROR: ${uploadResult.error.info} [${uploadResult.error.code}]`);
        } else if (uploadResult.upload.result === 'Warning') {
            this.log(`WARNING: ${JSON.stringify(uploadResult.upload)}`);
        } else {
            this.log(`Successfully uploaded ${image.title}!`);
        }
    }
    /**
     * Starts the upload process.
     */
    async start() {
        this.log('========================================');
        this.setState({
            running: true
        });
        const wikiFrom = new Wiki(this.state.wikiFrom),
              wikiTo = new Wiki(this.state.wikiTo),
              uploader = new UploaderApi(wikiFrom, wikiTo);
        this.log('Logging in...');
        await uploader.login(this.state.username, this.state.password);
        this.log('Fetching the list of files...');
        const images = await this.getImages(uploader);
        const all = images.length;
        this.log(`Uploading ${all} files...`);
        let progress = 0;
        for (const image of images) {
            if (this.state.stopping) {
                break;
            }
            this.log(`Uploading ${image.title}...`);
            await this.uploadImage(image, uploader);
            this.setState({
                progress: Math.round(++progress / all * 100)
            });
        }
        this.log('Finished!');
        this.setState({
            progress: 0,
            running: false,
            stopping: false
        });
    }
    /**
     * Stops the upload process.
     */
    stop() {
        this.log('Stopping...');
        this.setState({
            stopping: true
        });
    }
}

// Renders the application component.
render(<Base />);
