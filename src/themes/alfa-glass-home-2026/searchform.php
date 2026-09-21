<form role="search" method="get" id="searchform" action="<?php echo home_url( '/' ) ?>" >
    <input class="search-input" type="text" value="<?php echo get_search_query() ?>" name="s" id="s" placeholder="Поиск по сайту"/>
    <div class="submit-wrapper">
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 16L13.0834 13.0833M15.1667 8.08333C15.1667 11.9954 11.9954 15.1667 8.08333 15.1667C4.17132 15.1667 1 11.9954 1 8.08333C1 4.17132 4.17132 1 8.08333 1C11.9954 1 15.1667 4.17132 15.1667 8.08333Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <input type="submit" id="searchsubmit" value="найти" />
    </div>
</form>