window.onload = function () {
    var tmp = window.performance.timing;
    var perf = "DNS: " + (tmp.domainLookupEnd - tmp.domainLookupStart) + "ms" +
        "\nTCP: " + (tmp.connectEnd - tmp.connectStart) + "ms" +
        "\nreq请求: " + (tmp.responseEnd - tmp.responseStart) + "ms" +
        "\ndom解析: " + (tmp.domComplete - tmp.domInteractive) + "ms" +
        "\n白屏: " + (tmp.domLoading - tmp.fetchStart) + "ms" +
        "\n总: " + (tmp.loadEventStart - tmp.fetchStart) + "ms";
    ERROR.logtype = "performance";
    ERROR.log = perf;
    // alert(JSON.stringify(perf));
    // ajax.post('/data/updateLog', ERROR);
}