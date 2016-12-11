var gso = {}; // global scoped object

(function () {
  $(function () {

    $('.activity-panel-toggle-btn').on('click', toggleActivityPanel);;
    $('#sidebar-toggle-btn').on('click', toggleSidebar);
  })


  function toggleActivityPanel(e) {
    $this = $(this);
    $this.next().slideToggle();
    $this.find('span.glyphicon').toggleClass('glyphicon-menu-up');
  }

  function toggleSidebar() {
    $lfSidebar = $('.left-sidebar');


    if ($lfSidebar.hasClass('sidebar-hidden')) {
      $('.left-sidebar').animate({width: '270'},updateMapSize);
      // $('.content-wrap').animate({paddingLeft: '270'},updateMapSize);
      $(this).css('color', 'black');
      $lfSidebar.removeClass('sidebar-hidden');
    } else {
      $('.left-sidebar').animate({width: '35'}, updateMapSize);
      // $('.content-wrap').animate({paddingLeft: '35'},updateMapSize);
      $(this).css('color', '#cfcfcf');
      $lfSidebar.addClass('sidebar-hidden');
    }


  }

  function updateMapSize() {
    if (OLMap && OLMap.updateSize) {
        OLMap.updateSize();
    }

  }

})();
