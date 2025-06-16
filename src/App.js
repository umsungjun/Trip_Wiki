import Header from "./components/Header.js";
import RegionList from "./components/RegionList.js";
import CityList from "./components/CityList.js";
import CityDetail from "./components/CityDetail.js";

import { request } from "./components/api.js";

export default function App($app) {
  const urlParams = new URLSearchParams(window.location.search);
  const getSortBy = () => {
    return urlParams.get("sort") || "total";
  };
  const getSearchWord = () => {
    return urlParams.get("search") || "";
  };

  this.state = {
    startIdx: 0,
    sortBy: getSortBy(),
    searchWord: getSearchWord(),
    region: "",
    cities: "",
  };

  const header = new Header({
    $app,
    initialState: {
      sortBy: this.state.sortBy,
      searchWord: this.state.searchWord,
    },
    handleSortChange: async (sortBy) => {
      const pageUrl = `/${this.state.region}?sort=${sortBy}`;
      history.pushState(
        null,
        "",
        this.state.searchWord
          ? `${pageUrl}&search=${this.state.searchWord}`
          : pageUrl
      );

      const cities = await request(
        0,
        this.state.region,
        sortBy,
        this.state.searchWord
      );

      this.setState({
        ...this.state,
        startIdx: 0,
        sortBy: sortBy,
        cities: cities,
      });
    },
    handleSearch: async (searchWord) => {
      history.pushState(
        null,
        "",
        `/${this.state.region}?sort=${this.state.sortBy}&search=${searchWord}`
      );

      const cities = await request(
        0,
        this.state.region,
        this.state.sortBy,
        searchWord
      );
      this.setState({
        ...this.state,
        startIdx: 0,
        searchWord: searchWord,
        cities: cities,
      });
    },
  });

  const regionList = new RegionList({
    $app,
    initialState: this.state.region,
    handleRegion: async (region) => {
      history.pushState(null, "", `/${region}?sort=${this.state.sortBy}`);
      const cities = await request(0, region, "total", "");
      this.setState({
        startIdx: 0,
        sortBy: "total",
        searchWord: "",
        region: region,
        cities: cities,
      });
    },
  });

  const cityList = new CityList({
    $app,
    initialState: this.state.cities,
    handleLoadMore: async () => {
      const newStartIdx = this.state.startIdx + 40;
      const newCities = await request(
        newStartIdx,
        this.state.region,
        this.state.sortBy,
        this.state.searchWord
      );
      this.setState({
        ...this.state,
        startIdx: newStartIdx,
        cities: {
          ...this.state.cities,
          cities: [...this.state.cities.cities, ...newCities.cities],
          isEnd: newCities.isEnd,
        },
      });
    },
  });

  const cityDetail = new CityDetail();

  this.setState = (newState) => {
    this.state = newState;
    cityList.setState(this.state.cities);
    header.setState({
      sortBy: this.state.sortBy,
      searchWord: this.state.searchWord,
    });
    regionList.setState(this.state.region);
  };

  window.addEventListener("popstate", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlPath = window.location.pathname;

    const prevRegion = urlPath.replace("/", "") || "All";
    const prevSortBy = urlParams.get("sort") || "total";
    const prevSearchWord = urlParams.get("search") || "";

    const prevCities = await request(0, prevRegion, prevSortBy, prevSearchWord);

    this.setState({
      ...this.state,
      startIdx: 0,
      region: prevRegion,
      sortBy: prevSortBy,
      searchWord: prevSearchWord,
      cities: prevCities,
    });

    request(0, region, sortBy, searchWord).then((cities) => {
      this.setState({
        ...this.state,
        cities: cities,
      });
    });
  });

  const init = async () => {
    const cities = await request(
      this.state.startIdx,
      this.state.region,
      this.state.sortBy,
      this.state.searchWord
    );

    this.setState({
      ...this.state,
      cities: cities,
    });
  };

  init();
}
