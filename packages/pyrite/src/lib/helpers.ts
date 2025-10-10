Number.prototype.decimals = function(decimals) {
    return Number(Math.round(this+'e'+decimals)+'e-'+decimals)
}
