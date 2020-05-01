const app = angular.module("app", []);


const useExample = true;
const useRemoteServer = false;
const isLiveEdit = location.href.match(/https?:\/\/localhost:\d{5}\/.+/).length > 0;
const isLocalhost = location.href.match(/https?:\/\/localhost:\d+\/.+/).length > 0 || location.href.match(/^file:\/\/\//);

// empty if use on
const API_SERVER_URL = useRemoteServer ? "http://picstories.me:80/api" : "api";

app.controller('pageCtrl', function ($scope, $http) {
    window.$scope = $scope;
    window.$http = $http;

    $scope.metadata = parseMetadata();
    $scope.comic = null;
    $scope.pages = {};
    $scope.page = {};

    $scope.fetchComic = function () {
        if (useExample) {
            import('./examples.mjs').then(module => {
                window.XKCD_COMIC = module.XKCD_COMIC;
                $scope.comic = XKCD_COMIC;
                $scope.metadata.pageCount = $scope.comic.pageCount;
                console.log("in LiveEdit, setting $scope.comic to: ");
                console.log($scope.comic);
                $scope.$apply();
            });
        } else {
            $http.get(`${API_SERVER_URL}/comics/${$scope.metadata.comicId}`)
                .then(function (response) {
                    $scope.comic = response.data;
                    $scope.metadata.pageCount = $scope.comic.pageCount;
                }, $scope.showError);
        }
    };

    $scope.fetchPages = function (from = $scope.metadata.pageNumber | 1, count = 5) {
        if (useExample) {
            import('./examples.mjs').then(module => {
                window.XKCD_PAGES = module.XKCD_PAGES;
                console.log("in LiveEdit, setting $scope.pages to: ");
                console.log(module.XKCD_PAGES);;
                $scope.addPages(module.XKCD_PAGES);
                $scope.page = $scope.pages[$scope.metadata.pageNumber];
                $scope.$apply();
            });
        } else {
            $http.get(`${API_SERVER_URL}/comics/${$scope.metadata.comicId}/pages?from=${from}&count=${count}`)
                .then(function (response) {
                    $scope.addPages(response.data)
                }, $scope.showError);
        }
    };

    $scope.openPage = function (number) {
        let page = $scope.pages[number];
        console.log("open page " + number);
        console.log(page);
        if (number < $scope.metadata.pageCount && $scope.pages[number + 1] == null) {
            $scope.fetchPages(number + 1)
        } else if (number > 1 && $scope.pages[number - 1] == null) {
            $scope.fetchPages(number - 1, 1);
        } else if (page != null) {
            $scope.page = page;
            $scope.metadata.pageNumber = number;
            let url = location.href.replace(/page=\d+/, "page=" + number)
            window.history.pushState("", "", url);
        }
    };

    $scope.addPages = function (pages) {
        for (let page of pages) {
            $scope.pages[page.number] = page;
        }
    };

    $scope.getLargeUrl = function (image) {
        return orDefault(image.largeUrl, image.url);
    };

    $scope.getPreview = function (number) {
        if ($scope.page == null) return null;
        let wantedNumber = $scope.page.number + number;
        // if (wantedNumber < 1 || wantedNumber >= $scope.metadata.pageCount) {
        if ($scope.pages[wantedNumber] == null) {
            return null
        } else {
            let image = $scope.pages[wantedNumber].images[0];
            return orDefault(image.previewUrl, image.url);
        }
    };

    $scope.showError = function (reason = "") {
        alert("Произошла ошибка!")
    };

    $scope.fetchComic();
    $scope.fetchPages();
});

function parseMetadata() {
    let comicId = location.href.match(/comic=([^#&]+)/)[1];
    let page = location.href.match(/page=([^#&]+)/)[1];
    return {
        comicId: comicId,
        pageNumber: orDefault(page, 1)
    }
}

function orDefault(value, defaultValue) {
    return value != null && value !== "" ? value : defaultValue;
}