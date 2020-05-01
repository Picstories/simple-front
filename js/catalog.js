const app = angular.module("app", []);

const useExample = true;
const useRemoteServer = false;
const isLiveEdit = location.href.match(/https?:\/\/localhost:\d{5}\/.+/).length > 0;
const isLocalhost = location.href.match(/https?:\/\/localhost:\d+\/.+/).length > 0 || location.href.match(/^file:\/\/\//);

// empty if use on
const API_SERVER_URL = useRemoteServer ? "http://picstories.me:80/api" : "api";


app.controller('catalogCtrl', function ($scope, $http) {
    window.$scope = $scope;
    window.$http = $http;

    $scope.comics = [];

    $scope.fetchComics = function (append = true, page = 0, size = 20) {
        if (useExample) {
            import('./examples.mjs').then(module => {
                window.COMICS_EXAMPLE = module.COMICS_EXAMPLE;
                $scope.comics = COMICS_EXAMPLE;
                $scope.metadata = {
                    total: $scope.comics.length,
                    size: 20,
                    page: 0
                };
                console.log("in LiveEdit, setting $scope.comics to: ");
                console.log($scope.comics);
                $scope.$apply();
            });

        } else {
            $http.get(`${API_SERVER_URL}/comics?page=${page}&size=${size}`)
                .then(function (response) {
                        $scope.setComics(append, response.data.comics);
                        $scope.metadata = {
                            total: response.data.total,
                            size : size,
                            page: page
                        }
                    }, $scope.showError);
        }
    };

    $scope.setComics = function (append = false, comics) {
        if (append) {
            if ($scope.comics == null) $scope.comics = [];
            $scope.comics.push(comics);
        } else {
            $scope.comics = comics;
        }
    };

    $scope.onpageCount = function(count, total) {
        if (count == total) {
            return `на странице все ${numberSuffix(total, "комикс")}`
        } else {
            return `на странице ${count} из ${numberSuffix(total, "комикс")}`
        }
    };

    $scope.showError = function (reason = "") {
        alert("Произошла ошибка!")
    };

    $scope.numberSuffix = numberSuffix;
    $scope.shortenString = shortenString;

    $scope.fetchComics(false);
});

function numberSuffix(count, word) {
    let suffix = "";
    if (count > 4 && count < 20) suffix = "ов"; // 11 комиксов
    else if (count % 10 === 1) suffix = ""; // 21 комикс
    else if (count % 10 < 5) suffix = "а"; // 32 комикса
    else suffix = "ов"; // 28 комиксов
    return count + " " + word + suffix;
}

function shortenString(string, length) {
    return string.length > length ? string.substring(0, length - 3) + "..." : string;
}