import { Component } from 'react';
import { getPhoto } from 'utils/api';
import { SearchField } from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { GlobalStyle } from 'GlobalStyle';
import { Button } from './Button/Button';
import { Loader } from './Loader/Loader';
import { Modal } from './Modal/Modal';
import { Message } from './Message/Message';

export class App extends Component {
  state = {
    photos: [],
    request: '',
    page: 1,
    per_page: 12,
    totalPages: 0,
    largeImageURL: '',
    contentLoad: false,
    showModal: false,
    message: '',
  };

  componentDidMount() {
    this.setState({
      message: 'To display pictures, enter a query in the search field',
    });
    this.getData();
  }

  componentDidUpdate(_, prevState) {
    if (
      prevState.request !== this.state.request ||
      prevState.page !== this.state.page
    ) {
      this.setState({ message: '' });
      this.getData(this.state.request, this.state.page, this.state.per_page);
    }
  }

  getData = (request, page, per_page) => {
    this.setState({ contentLoad: false });
    if (!request) {
      this.setState({ contentLoad: true });
      return;
    }
    getPhoto(request, page, per_page).then(r => {
      if (r.hits.length === 0) {
        this.setState({
          message: 'Sorry, nothing was found, please try your search again',
        });
      }
      const photos = r.hits.map(({ id, webformatURL, largeImageURL }) => ({
        id,
        webformatURL,
        largeImageURL,
      }));
      this.setState(prevState => ({
        photos: [...prevState.photos, ...photos],
        totalPages: r.totalHits / this.state.per_page,
        contentLoad: true,
      }));
    });
  };

  searchResponse = e => {
    e.preventDefault();
    if (!e.target.findForm.value) {
      this.setState({
        message: 'Please fill in the search field',
      });
    }
    this.setState({ request: e.target.findForm.value, page: 1, photos: [] });
    e.target.reset();
  };

  loadMore = () => {
    this.setState(prevState => ({
      page: prevState.page + 1,
    }));
  };

  getLargeImg = largeImageURL => {
    this.setState({ showModal: true, largeImageURL: largeImageURL });
  };

  onCloseModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const {
      photos,
      page,
      totalPages,
      largeImageURL,
      contentLoad,
      showModal,
      message,
    } = this.state;
    return (
      <div className="app">
        <SearchField search={this.searchResponse} />
        {message && <Message message={message} />}
        <ImageGallery photos={photos} getLargeImg={this.getLargeImg} />
        {!contentLoad && <Loader />}
        {totalPages > page && (
          <Button text="Load more" loadMore={this.loadMore} />
        )}
        {showModal && (
          <Modal largeImageURL={largeImageURL} onClose={this.onCloseModal} />
        )}

        <GlobalStyle />
      </div>
    );
  }
}
