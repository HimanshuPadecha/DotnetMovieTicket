namespace Ticket_Management_System.DTOS;

// ── Auth ──────────────────────────────────────────────
public class LoginDTO
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class RegisterDTO
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class UpdateProfileDTO
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
}

public class ChangePasswordDTO
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}

// ── Movies ────────────────────────────────────────────
public class MovieCreateDTO
{
    public string Title { get; set; } = null!;
    public string Genre { get; set; } = null!;
    public string Language { get; set; } = null!;
    public int DurationMinutes { get; set; }
    public string Rating { get; set; } = "U/A";
    public string Description { get; set; } = null!;
    public DateTime ReleaseDate { get; set; }
    public string? ImageUrl { get; set; }
    public string? BackdropUrl { get; set; }
}

public class MovieUpdateDTO
{
    public string Title { get; set; } = null!;
    public string Genre { get; set; } = null!;
    public string Language { get; set; } = null!;
    public int DurationMinutes { get; set; }
    public string Rating { get; set; } = "U/A";
    public string Description { get; set; } = null!;
    public DateTime ReleaseDate { get; set; }
    public string? ImageUrl { get; set; }
    public string? BackdropUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

// ── Theatres / Screens ────────────────────────────────
public class TheatreCreateDTO
{
    public string Name { get; set; } = null!;
    public string City { get; set; } = null!;
    public string Address { get; set; } = null!;
}

public class TheatreUpdateDTO
{
    public string Name { get; set; } = null!;
    public string City { get; set; } = null!;
    public string Address { get; set; } = null!;
}

public class ScreenCreateDTO
{
    public string Name { get; set; } = null!;
    public int TheatreId { get; set; }
    public int Rows { get; set; } = 4;
    public int SeatsPerRow { get; set; } = 5;
}

// ── Shows ─────────────────────────────────────────────
public class ShowCreateDTO
{
    public int MovieId { get; set; }
    public int ScreenId { get; set; }
    public DateTime StartTime { get; set; }
    public decimal TicketPrice { get; set; }
}

public class ShowUpdateDTO
{
    public DateTime StartTime { get; set; }
    public decimal TicketPrice { get; set; }
}

// ── Bookings ──────────────────────────────────────────
public class BookTicketsDTO
{
    public int ShowId { get; set; }
    public List<string> SeatNumbers { get; set; } = new();
}
