using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MembersController(AppDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<AppUser>>> GetMembers() {
            var result = await context.Users.ToListAsync();
            return result;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AppUser>> GetMember(string id){
            var member = await context.Users.FindAsync(id);
            if(member == null) return NotFound();
            return member;
        }
    }
}
