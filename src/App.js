import Header from "./components/Header.js";
import RegionList from "./components/RegionList.js";
import CityList from "./components/CityList.js";
import CityDetail from "./components/CityDetail.js";

import { request, requestCityDetail } from "./components/api.js";
import { getCurrentPath } from "./util/util.js";

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

  const renderHeader = () => {
    new Header({
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
  };

  const renderRegionList = () => {
    new RegionList({
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
  };

  const renderCityList = () => {
    new CityList({
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
      handleItemClick: (id) => {
        history.pushState(null, "", `/city/${id}`);
        this.setState(this.state);
      },
    });
  };

  const renderCityDetail = async (cityId) => {
    try {
      const cityDetailData = await requestCityDetail(cityId);
      new CityDetail({ $app, initialState: cityDetailData });
    } catch (error) {
      console.log("상세 페이지 렌더링 실패:", error);
    }
  };

  this.setState = (newState) => {
    this.state = newState;
    render();
  };

  const render = () => {
    $app.innerHTML = "";

    renderHeader();
    if (getCurrentPath().startsWith("/city/")) {
      const cityId = getCurrentPath().replace("/city/", "");
      renderCityDetail(cityId);
    } else {
      /* 리스트 페이지 랜더링 */
      renderRegionList();
      renderCityList();
    }
  };

  window.addEventListener("popstate", async () => {
    const urlParams = new URLSearchParams(window.location.search);

    const prevRegion = getCurrentPath().replace("/", "") || "All";
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
    $app.innerHTML = "";

    renderHeader();
    if (getCurrentPath().startsWith("/city/")) {
      render();
    } else {
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
    }
  };

  init();
}
