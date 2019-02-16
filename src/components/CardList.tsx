import React from 'react';
import { connect } from 'react-redux';

import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';

import { CardListProps } from '../types/ui';
import ContentCard from './ContentCard';
import styles from '../css/sidebar.css';

import { STATE_DATA, STATE_HELPER, STATE_UI } from '../redux/reducers';
import { DataState } from '../redux/reducers/data';
import { UiState } from '../redux/reducers/ui';
import { HelperState } from '../redux/reducers/helper';
import { loadMoreCard } from '../redux/actions/ui';
import { generateCardList } from '../redux/selectors';

class CardList extends React.PureComponent<CardListProps, null> {
  private readonly scrollRef: React.RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);
    this.scrollRef = React.createRef();
  }

  componentDidUpdate(prevProps: CardListProps) {
    if (prevProps.type !== this.props.type || prevProps.course !== this.props.course) {
      this.scrollRef.current.scrollTop = 0;
    }
  }

  public render() {
    const { contents, threshold, title, loadMore, ...rest } = this.props;
    const filtered = contents.slice(0, threshold);

    const canLoadMore = threshold < contents.length;

    return (
      <div
        className={styles.card_list}
        onScroll={ev => {
          if (!canLoadMore) return;
          const self = ev.target as HTMLDivElement;
          const bottomLine = self.scrollTop + self.clientHeight;
          if (bottomLine + 180 > self.scrollHeight)
            // 80 px on load more hint
            loadMore();
        }}
        ref={this.scrollRef}
        {...rest}
      >
        <List
          className={styles.card_list_inner}
          component="nav"
          subheader={
            <ListSubheader component="div" className={styles.card_list_header}>
              <span className={styles.card_list_header_text}>{title}</span>
            </ListSubheader>
          }
        >
          {filtered.map(c => (
            <ContentCard key={c.id} content={c} />
          ))}

          {canLoadMore ? (
            <div className={styles.card_list_load_more} onClick={loadMore}>
              加载更多
            </div>
          ) : null}
        </List>
      </div>
    );
  }
}

const mapStateToProps = (state): Partial<CardListProps> => {
  const data = state[STATE_DATA] as DataState;
  const ui = state[STATE_UI] as UiState;
  const loggedIn = (state[STATE_HELPER] as HelperState).loggedIn;

  if (!loggedIn) {
    return {
      contents: [],
      title: '加载中...',
    };
  }

  return {
    type: ui.cardTypeFilter,
    course: ui.cardCourseFilter,
    ...generateCardList(data, data.lastUpdateTime, ui.cardTypeFilter, ui.cardCourseFilter),
    title: ui.cardListTitle,
    threshold: ui.cardVisibilityThreshold,
  };
};

const mapDispatchToProps = (dispatch): Partial<CardListProps> => {
  return {
    loadMore: () => {
      dispatch(loadMoreCard());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CardList);
