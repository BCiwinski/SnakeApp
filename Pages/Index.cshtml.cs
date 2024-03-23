using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;
using SnakeApp.Model;

namespace SnakeApp.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        private readonly GamemodeOptions _gamemodes;

        public IndexModel(ILogger<IndexModel> logger, IOptionsSnapshot<GamemodeOptions> gamemodeOptions)
        {
            _logger = logger;
            _gamemodes = gamemodeOptions.Value;
        }

        public void OnGet()
        {

        }
    }
}
