// @flow

import { generateRoomWithoutSeparator } from '@jitsi/js-utils/random';
import { Component } from 'react';
import type { Dispatch } from 'redux';

import { createWelcomePageEvent, sendAnalytics } from '../../analytics';
import { appNavigate } from '../../app/actions';
import isInsecureRoomName from '../../base/util/isInsecureRoomName';
import { isCalendarEnabled } from '../../calendar-sync';
import { isRecentListEnabled } from '../../recent-list/functions';

/**
 * {@code AbstractWelcomePage}'s React {@code Component} prop types.
 */
export type Props = {

    /**
     * Whether the calendar functionality is enabled or not.
     */
    _calendarEnabled: boolean,

    /**
     * Whether the insecure room name functionality is enabled or not.
     */
    _enableInsecureRoomNameWarning: boolean,

    /**
     * URL for the moderated rooms microservice, if available.
     */
    _moderatedRoomServiceUrl: ?string,

    /**
     * Whether the recent list is enabled.
     */
    _recentListEnabled: Boolean,

    /**
     * Room name to join to.
     */
    _room: string,

    /**
     * The current settings.
     */
    _settings: Object,

    /**
     * The Redux dispatch Function.
     */
    dispatch: Dispatch<any>
};

/**
 * Base (abstract) class for container component rendering the welcome page.
 *
 * @abstract
 */
export class AbstractWelcomePage<P: Props> extends Component<P, *> {
    _mounted: ?boolean;

    /**
     * Save room name into component's local state.
     *
     * @type {Object}
     * @property {number|null} animateTimeoutId - Identifier of the letter
     * animation timeout.
     * @property {string} generatedRoomname - Automatically generated room name.
     * @property {string} room - Room name.
     * @property {string} roomPlaceholder - Room placeholder that's used as a
     * placeholder for input.
     * @property {number|null} updateTimeoutId - Identifier of the timeout
     * updating the generated room name.
     */
    state = {
        animateTimeoutId: undefined,
        generatedRoomname: '',
        insecureRoomName: false,
        joining: false,
        room: '',
        roomPlaceholder: '',
        updateTimeoutId: undefined,
        isModerator: false,
    };

    /**
     * Initializes a new {@code AbstractWelcomePage} instance.
     *
     * @param {Props} props - The React {@code Component} props to initialize
     * the new {@code AbstractWelcomePage} instance with.
     */
    constructor(props: P) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._animateRoomnameChanging
            = this._animateRoomnameChanging.bind(this);
        this._onJoin = this._onJoin.bind(this);
        this._onRoomChange = this._onRoomChange.bind(this);
        this._renderInsecureRoomNameWarning = this._renderInsecureRoomNameWarning.bind(this);
        this._updateRoomname = this._updateRoomname.bind(this);
        this._onRoleChange = this._onRoleChange.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}. Invoked
     * immediately after mounting occurs.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._mounted = true;
        sendAnalytics(createWelcomePageEvent('viewed', undefined, { value: 1 }));
    }

    /**
     * Implements React's {@link Component#componentWillUnmount()}. Invoked
     * immediately before this component is unmounted and destroyed.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._clearTimeouts();
        this._mounted = false;
    }

    _animateRoomnameChanging: (string) => void;

    /**
     * Animates the changing of the room name.
     *
     * @param {string} word - The part of room name that should be added to
     * placeholder.
     * @private
     * @returns {void}
     */
    _animateRoomnameChanging(word: string) {
        let animateTimeoutId;
        const roomPlaceholder = this.state.roomPlaceholder + word.substr(0, 1);

        if (word.length > 1) {
            animateTimeoutId
                = setTimeout(
                    () => {
                        this._animateRoomnameChanging(
                            word.substring(1, word.length));
                    },
                    70);
        }
        this.setState({
            animateTimeoutId,
            roomPlaceholder
        });
    }

    /**
     * Method that clears timeouts for animations and updates of room name.
     *
     * @private
     * @returns {void}
     */
    _clearTimeouts() {
        clearTimeout(this.state.animateTimeoutId);
        clearTimeout(this.state.updateTimeoutId);
    }

    /**
     * Renders the insecure room name warning.
     *
     * @returns {ReactElement}
     */
    _doRenderInsecureRoomNameWarning: () => React$Component<any>;

    _onJoin: () => void;

    /**
     * Handles joining. Either by clicking on 'Join' button
     * or by pressing 'Enter' in room name input field.
     *
     * @protected
     * @returns {void}
     */
    _onJoin() {
        const room = this.state.room || this.state.generatedRoomname;
        const isModerator = this.state.isModerator;

        sendAnalytics(
            createWelcomePageEvent('clicked', 'joinButton', {
                isGenerated: !this.state.room,
                room
            }));

        if (room) {
            this.setState({ joining: true });

            // By the time the Promise of appNavigate settles, this component
            // may have already been unmounted.
            const onAppNavigateSettled
                = () => this._mounted && this.setState({ joining: false });

            this.props.dispatch(appNavigate(room, isModerator))
                .then(onAppNavigateSettled, onAppNavigateSettled);
        }
    }

    _onRoleChange: (boolean) => void;

    /**
     * Handles 'change' event for the user role from Role Selection dialog
     * 
     * @param {boolean} value - Indicates the user's role is Moderator or not
     * @protected
     * @returns {void}
     */
    _onRoleChange(value) {
        this.setState({
            isModerator: value
        });
    }

    _onRoomChange: (string) => void;

    /**
     * Handles 'change' event for the room name text input field.
     *
     * @param {string} value - The text typed into the respective text input
     * field.
     * @protected
     * @returns {void}
     */
    _onRoomChange(value: string) {
        this.setState({
            room: value,
            insecureRoomName: this.props._enableInsecureRoomNameWarning && value && isInsecureRoomName(value)
        });
    }

    _renderInsecureRoomNameWarning: () => React$Component<any>;

    /**
     * Renders the insecure room name warning if needed.
     *
     * @returns {ReactElement}
     */
    _renderInsecureRoomNameWarning() {
        if (this.props._enableInsecureRoomNameWarning && this.state.insecureRoomName) {
            return this._doRenderInsecureRoomNameWarning();
        }

        return null;
    }

    _updateRoomname: () => void;

    /**
     * Triggers the generation of a new room name and initiates an animation of
     * its changing.
     *
     * @protected
     * @returns {void}
     */
    _updateRoomname() {
        const generatedRoomname = generateRoomWithoutSeparator();
        const roomPlaceholder = '';
        const updateTimeoutId = setTimeout(this._updateRoomname, 10000);

        this._clearTimeouts();
        this.setState(
            {
                generatedRoomname,
                roomPlaceholder,
                updateTimeoutId
            },
            () => this._animateRoomnameChanging(generatedRoomname));
    }
}

/**
 * Maps (parts of) the redux state to the React {@code Component} props of
 * {@code AbstractWelcomePage}.
 *
 * @param {Object} state - The redux state.
 * @protected
 * @returns {Props}
 */
export function _mapStateToProps(state: Object) {
    return {
        _calendarEnabled: isCalendarEnabled(state),
        _enableInsecureRoomNameWarning: state['features/base/config'].enableInsecureRoomNameWarning || false,
        _moderatedRoomServiceUrl: state['features/base/config'].moderatedRoomServiceUrl,
        _recentListEnabled: isRecentListEnabled(),
        _room: state['features/base/conference'].room,
        _settings: state['features/base/settings']
    };
}